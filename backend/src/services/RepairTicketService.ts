import {
  crewRepository,
  faultReportRepository,
  gridAssetRepository,
  repairTicketRepository,
  transaction
} from "../repositories/store";
import {
  createRepairTicketDto,
  type DispatchPlanDto,
  type RepairTicketDto
} from "../constructors/RepairTicketDtoFactory";
import { evaluateCrewForFault, evaluateDispatch } from "../rules/dispatchRules";
import { requiredSkillOf, OPEN_TICKET_STATUSES } from "../rules/skillMatrix";
import { BusinessError } from "../utils/businessError";
import { ERROR_CODES } from "../constants/errorCodes";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";
import { TicketStatus } from "../constants/TicketStatus";
import type { RepairTicketPayload } from "../types/RepairTicketPayload";

const NEXT_STATUS: Record<string, string> = {
  ASSIGNED: "ARRIVED",
  ARRIVED: "REPAIRING",
  REPAIRING: "RESTORED",
  RESTORED: "CLOSED"
};

const toDto = (ticketId: number): RepairTicketDto => {
  const ticket = repairTicketRepository.findById(ticketId)!;
  const fault = faultReportRepository.findById(ticket.fault_report_id);
  return createRepairTicketDto(ticket, {
    fault,
    asset: fault ? gridAssetRepository.findById(fault.asset_id) : undefined,
    crew: ticket.team_id ? crewRepository.findById(ticket.team_id) : undefined
  });
};

export const repairTicketService = {
  list: (): RepairTicketDto[] =>
    repairTicketRepository
      .findAll()
      .map((ticket) =>
        createRepairTicketDto(ticket, {
          fault: faultReportRepository.findById(ticket.fault_report_id),
          asset: (() => {
            const fault = faultReportRepository.findById(ticket.fault_report_id);
            return fault ? gridAssetRepository.findById(fault.asset_id) : undefined;
          })(),
          crew: ticket.team_id ? crewRepository.findById(ticket.team_id) : undefined
        })
      )
      .sort((a, b) => b.id - a.id),

  /**
   * 派工前分析：返回每个班组对该故障的资格判定与逐条阻断原因。
   * 规则在 rules/dispatchRules，页面据此渲染"可派 / 阻断原因 / 当前占用"。
   */
  dispatchPlan(ticketId: number): DispatchPlanDto {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new BusinessError(ERROR_CODES.TICKET_NOT_FOUND, { ticket_id: ticketId }, 404);
    const fault = faultReportRepository.findById(ticket.fault_report_id);
    if (!fault) throw new BusinessError(ERROR_CODES.FAULT_NOT_FOUND, { fault_report_id: ticket.fault_report_id }, 404);

    const plan = evaluateDispatch(crewRepository.findAll(), fault.fault_type);
    return {
      ticket_id: ticket.id,
      fault_report_id: fault.id,
      fault_type: fault.fault_type,
      required_skill: plan.required_skill,
      required_skill_label: plan.required_skill_label,
      options: plan.checks,
      has_eligible_crew: plan.eligibleCrews.length > 0,
      blocked_reason:
        plan.eligibleCrews.length === 0
          ? `故障类型 ${fault.fault_type} 需要【${plan.required_skill_label}】技能，当前没有待命且空闲的合格班组`
          : null
    };
  },

  /**
   * 派工：故障单状态、工单状态、班组占用必须在同一事务同时更新。
   * 派单前按规则复核：工单未派过、班组存在、技能匹配、待命、无未结工单。
   */
  dispatch(ticketId: number, payload: RepairTicketPayload): RepairTicketDto {
    const teamId = Number(payload.team_id);
    const dispatcherId = Number((payload as Record<string, unknown>).dispatcher_id ?? 9001);
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new BusinessError(ERROR_CODES.TICKET_NOT_FOUND, { ticket_id: ticketId }, 404);
    if (ticket.status !== "WAIT_DISPATCH") {
      throw new BusinessError(ERROR_CODES.TICKET_ALREADY_DISPATCHED, { team_id: ticket.team_id ?? "none" }, 409);
    }
    const fault = faultReportRepository.findById(ticket.fault_report_id);
    if (!fault) throw new BusinessError(ERROR_CODES.FAULT_NOT_FOUND, { fault_report_id: ticket.fault_report_id }, 404);
    const crew = crewRepository.findById(teamId);
    if (!crew) throw new BusinessError(ERROR_CODES.CREW_NOT_FOUND, { team_id: teamId }, 404);

    // 规则复核：任一条件不满足即给出明确阻断码，阻断写入。
    const check = evaluateCrewForFault(crew, fault.fault_type);
    if (!check.eligible) {
      const reason = check.reasons[0];
      console.info(
        renderLog(LOG_TEMPLATES.RepairTicket.dispatchBlocked, {
          fault_id: fault.id,
          crew_id: crew.id,
          reason
        })
      );
      const meta: Record<string, string | number> = {
        crew_name: crew.name,
        required_skill: check.required_skill_label,
        actual_skills: check.actual_skills.join("/") || "无",
        duty_status: crew.duty_status,
        ticket_id: crew.current_ticket_id ?? 0
      };
      throw new BusinessError(ERROR_CODES[reason], meta, 409);
    }

    const now = new Date().toISOString();
    transaction(() => {
      repairTicketRepository.update(ticketId, {
        team_id: teamId,
        dispatcher_id: dispatcherId,
        status: "ASSIGNED",
        assigned_at: now
      });
      faultReportRepository.update(fault.id, { status: "ASSIGNED" });
      crewRepository.update(teamId, { current_ticket_id: ticketId });
    });

    console.info(
      renderLog(LOG_TEMPLATES.RepairTicket.dispatch, { ticket_id: ticketId, fault_id: fault.id, crew_id: teamId })
    );
    console.info(renderLog(LOG_TEMPLATES.Crew.occupy, { crew_id: teamId, ticket_id: ticketId }));
    return toDto(ticketId);
  },

  /** 到场 / 抢修中：只推进工单与故障单联动状态，不动班组占用（班组仍被占用）。 */
  advance(ticketId: number): RepairTicketDto {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new BusinessError(ERROR_CODES.TICKET_NOT_FOUND, { ticket_id: ticketId }, 404);
    const next = NEXT_STATUS[ticket.status];
    if (!next) {
      throw new BusinessError(ERROR_CODES.INVALID_TRANSITION, { from: ticket.status, to: "NEXT" }, 409);
    }
    const fault = faultReportRepository.findById(ticket.fault_report_id);
    transaction(() => {
      repairTicketRepository.update(ticketId, { status: next });
      faultReportRepository.update(ticket.fault_report_id, { status: next });
    });
    console.info(renderLog(LOG_TEMPLATES.RepairTicket.status, { ticket_id: ticketId, from: ticket.status, to: next }));
    return toDto(ticketId);
  },

  /**
   * 复电确认（必须处于 REPAIRING）：
   * 1. 工单 RESTORED + restored_at，故障单 RESTORED；
   * 2. 释放班组占用 current_ticket_id = null；
   * 3. 关联资产健康恢复为 NORMAL。
   * 三项在同一事务同时更新。
   */
  restore(ticketId: number): RepairTicketDto {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new BusinessError(ERROR_CODES.TICKET_NOT_FOUND, { ticket_id: ticketId }, 404);
    if (ticket.status !== "REPAIRING") {
      throw new BusinessError(ERROR_CODES.TICKET_STATUS_CONFLICT, { status: ticket.status, expected: "REPAIRING" }, 409);
    }
    const fault = faultReportRepository.findById(ticket.fault_report_id);
    if (!fault) throw new BusinessError(ERROR_CODES.FAULT_NOT_FOUND, { fault_report_id: ticket.fault_report_id }, 404);
    const crew = ticket.team_id ? crewRepository.findById(ticket.team_id) : undefined;
    const now = new Date().toISOString();

    transaction(() => {
      repairTicketRepository.update(ticketId, { status: "RESTORED", restored_at: now });
      faultReportRepository.update(fault.id, { status: "RESTORED" });
      if (crew) crewRepository.update(crew.id, { current_ticket_id: null });
      gridAssetRepository.update(fault.asset_id, { health_status: "NORMAL" });
    });

    console.info(
      renderLog(LOG_TEMPLATES.RepairTicket.restore, {
        ticket_id: ticketId,
        crew_id: crew?.id ?? 0,
        asset_id: fault.asset_id
      })
    );
    if (crew) {
      console.info(renderLog(LOG_TEMPLATES.Crew.release, { crew_id: crew.id, ticket_id: ticketId }));
    }
    console.info(renderLog(LOG_TEMPLATES.GridAsset.status, { asset_id: fault.asset_id, from: "*", to: "NORMAL" }));
    return toDto(ticketId);
  },

  // 供态势页统计复电时长
  restoredDurations: (): number[] =>
    repairTicketRepository
      .findAll()
      .filter((ticket) => ticket.restored_at && ticket.assigned_at)
      .map((ticket) => Date.parse(ticket.restored_at!) - Date.parse(ticket.assigned_at!))
      .filter((value) => Number.isFinite(value) && value >= 0),

  isOpenStatus: (status: string) => (OPEN_TICKET_STATUSES as readonly string[]).includes(status),
  requiredSkillLabel: (faultType: string) => requiredSkillOf(faultType).label,
  statuses: () => [...TicketStatus]
};
