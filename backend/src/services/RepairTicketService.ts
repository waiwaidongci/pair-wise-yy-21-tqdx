import { TicketStatus } from "../constants/TicketStatus";
import { FaultStatus } from "../constants/FaultStatus";
import { requiredSkillsOf } from "../constants/dispatchRules";
import { isOpenTicketStatus } from "../constants/ticketFlow";
import { RESTORED_HEALTH } from "../constants/healthRules";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES, renderMessage } from "../constants/errorMessages";
import { BusinessError } from "../utils/BusinessError";
import { nextTicketNo } from "../utils/numbering";
import { transaction } from "../store/dataStore";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { buildDispatchProfiles } from "./DispatchPolicy";
import { createRepairTicketDto } from "../constructors/RepairTicketDtoFactory";
import { createCrewAvailabilityDto } from "../constructors/CrewDtoFactory";
import { writeAudit } from "./AuditService";
import type { CrewDispatchProfile } from "../types/DispatchDecision";

export interface DispatchInput {
  fault_report_id: number;
  team_id?: number; // 不传则自动选择第一个合格班组
}

const NEXT_STATUS: Record<string, TicketStatus> = {
  ASSIGNED: "ARRIVED",
  ARRIVED: "REPAIRING",
  REPAIRING: "RESTORED"
};

export const repairTicketService = {
  list() {
    return repairTicketRepository.findAll().map((ticket) => {
      const fault = faultReportRepository.findById(ticket.fault_report_id);
      const crew = crewRepository.findById(ticket.team_id);
      const asset = fault ? gridAssetRepository.findById(fault.asset_id) : undefined;
      const parts = sparePartUsageRepository.findByTicketId(ticket.id);
      return createRepairTicketDto(ticket, fault, crew, parts, asset);
    });
  },

  /** 候选班组评估：逐条返回阻断原因与当前占用，不做任何写操作。 */
  candidates(faultReportId: number) {
    const fault = faultReportRepository.findById(Number(faultReportId));
    if (!fault) {
      throw new BusinessError(
        ERROR_CODES.FAULT_NOT_FOUND,
        renderMessage(ERROR_MESSAGES.FAULT_NOT_FOUND, { id: faultReportId }),
        404
      );
    }
    const requiredSkills = requiredSkillsOf(fault.fault_type);
    const profiles = buildDispatchProfiles(
      crewRepository.findAll(),
      requiredSkills,
      repairTicketRepository.findAll()
    );
    return createCrewAvailabilityDto(fault, requiredSkills, profiles);
  },

  /**
   * 派工：校验通过后在同一事务内
   * 1) 生成工单（ASSIGNED）；2) 班组 current_ticket_id 占用；3) 故障单转 PROCESSING。
   * 任一步失败整体回滚。
   */
  dispatch(input: DispatchInput, actor = "调度值班员") {
    const faultId = Number(input.fault_report_id);
    const fault = faultReportRepository.findById(faultId);
    if (!fault) {
      throw new BusinessError(
        ERROR_CODES.FAULT_NOT_FOUND,
        renderMessage(ERROR_MESSAGES.FAULT_NOT_FOUND, { id: faultId }),
        404
      );
    }
    if (repairTicketRepository.findOpenByFault(faultId)) {
      throw new BusinessError(
        ERROR_CODES.FAULT_ALREADY_DISPATCHED,
        renderMessage(ERROR_MESSAGES.FAULT_ALREADY_DISPATCHED, { faultNo: fault.fault_no })
      );
    }

    const requiredSkills = requiredSkillsOf(fault.fault_type);
    const profiles = buildDispatchProfiles(
      crewRepository.findAll(),
      requiredSkills,
      repairTicketRepository.findAll()
    );
    let chosen: CrewDispatchProfile | undefined;
    if (input.team_id != null) {
      chosen = profiles.find((profile) => profile.id === Number(input.team_id));
      if (!chosen) {
        throw new BusinessError(
          ERROR_CODES.CREW_NOT_FOUND,
          renderMessage(ERROR_MESSAGES.CREW_NOT_FOUND, { id: input.team_id }),
          404
        );
      }
      if (!chosen.eligible) {
        throw new BusinessError(
          chosen.reasons[0].code,
          chosen.reasons.map((reason) => reason.message).join("；"),
          409,
          { reasons: chosen.reasons }
        );
      }
    } else {
      chosen = profiles.find((profile) => profile.eligible);
      if (!chosen) {
        const reason = profiles
          .map((profile) => `${profile.name}：${profile.reasons[0]?.message ?? "不可接单"}`)
          .join("；");
        throw new BusinessError(
          ERROR_CODES.NO_AVAILABLE_CREW,
          renderMessage(ERROR_MESSAGES.NO_AVAILABLE_CREW, { reason }),
          409,
          { profiles }
        );
      }
    }

    const crew = crewRepository.findById(chosen.id)!;
    const asset = gridAssetRepository.findById(fault.asset_id);

    return transaction((tx) => {
      const now = new Date().toISOString();
      const ticket = repairTicketRepository.insertIn(tx, {
        ticket_no: nextTicketNo(),
        fault_report_id: fault.id,
        team_id: crew.id,
        dispatcher_id: 1,
        priority: fault.severity,
        status: TicketStatus[1], // ASSIGNED
        assigned_at: now,
        arrived_at: null,
        restored_at: null
      });
      crewRepository.occupyIn(tx, crew.id, ticket.id);
      faultReportRepository.updateStatusIn(tx, fault.id, FaultStatus[1]); // PROCESSING

      writeAudit(tx, actor, "RepairTicket", "create", "RepairTicket", ticket.ticket_no, {
        faultNo: fault.fault_no,
        ticketNo: ticket.ticket_no,
        crewName: crew.name
      });
      writeAudit(tx, actor, "Crew", "occupy", "Crew", crew.name, {
        crewName: crew.name,
        ticketNo: ticket.ticket_no
      });
      writeAudit(tx, actor, "FaultReport", "status", "FaultReport", fault.fault_no, {
        faultNo: fault.fault_no,
        from: FaultStatus[0],
        to: FaultStatus[1]
      });

      const savedFault = faultReportRepository.findById(fault.id);
      return createRepairTicketDto(ticket, savedFault, crew, [], asset);
    });
  },

  /** 到场 / 抢修中 等正向流转。 */
  progress(ticketId: number, actor = "班组长") {
    const ticket = repairTicketRepository.findById(Number(ticketId));
    if (!ticket) {
      throw new BusinessError(
        ERROR_CODES.TICKET_NOT_FOUND,
        renderMessage(ERROR_MESSAGES.TICKET_NOT_FOUND, { id: ticketId }),
        404
      );
    }
    const next = NEXT_STATUS[ticket.status];
    if (!next) {
      throw new BusinessError(
        ERROR_CODES.INVALID_TICKET_TRANSITION,
        renderMessage(ERROR_MESSAGES.INVALID_TICKET_TRANSITION, {
          ticketNo: ticket.ticket_no,
          from: ticket.status,
          to: "NEXT"
        })
      );
    }

    return transaction((tx) => {
      const patch: Parameters<typeof repairTicketRepository.updateStatusIn>[2] = { status: next };
      if (next === "ARRIVED") patch.arrived_at = new Date().toISOString();
      repairTicketRepository.updateStatusIn(tx, ticket.id, patch);
      writeAudit(tx, actor, "RepairTicket", "progress", "RepairTicket", ticket.ticket_no, {
        ticketNo: ticket.ticket_no,
        from: ticket.status,
        to: next
      });
      return this.list().find((row) => row.id === ticket.id);
    });
  },

  /**
   * 复电确认（仅 REPAIRING 可确认），同一事务内：
   * 1) 工单 RESTORED 并记录 restored_at；2) 释放班组占用；
   * 3) 故障单 RESOLVED；4) 关联资产健康恢复 NORMAL。
   */
  restore(ticketId: number, actor = "调度值班员") {
    const ticket = repairTicketRepository.findById(Number(ticketId));
    if (!ticket) {
      throw new BusinessError(
        ERROR_CODES.TICKET_NOT_FOUND,
        renderMessage(ERROR_MESSAGES.TICKET_NOT_FOUND, { id: ticketId }),
        404
      );
    }
    if (ticket.status !== "REPAIRING") {
      throw new BusinessError(
        ERROR_CODES.TICKET_NOT_RESTORABLE,
        renderMessage(ERROR_MESSAGES.TICKET_NOT_RESTORABLE, {
          ticketNo: ticket.ticket_no,
          status: ticket.status
        }),
        409
      );
    }

    const fault = faultReportRepository.findById(ticket.fault_report_id);
    const crew = crewRepository.findById(ticket.team_id);
    const asset = fault ? gridAssetRepository.findById(fault.asset_id) : undefined;

    return transaction((tx) => {
      const now = new Date().toISOString();
      repairTicketRepository.updateStatusIn(tx, ticket.id, {
        status: "RESTORED",
        restored_at: now
      });
      crewRepository.releaseIn(tx, ticket.team_id);
      if (fault) faultReportRepository.updateStatusIn(tx, fault.id, FaultStatus[2]);
      let healthBefore: string | undefined;
      if (asset) {
        healthBefore = asset.health_status;
        gridAssetRepository.updateHealthIn(tx, asset.id, RESTORED_HEALTH);
      }

      if (crew) {
        writeAudit(tx, actor, "Crew", "release", "Crew", crew.name, {
          crewName: crew.name,
          ticketNo: ticket.ticket_no
        });
      }
      if (fault) {
        writeAudit(tx, actor, "FaultReport", "status", "FaultReport", fault.fault_no, {
          faultNo: fault.fault_no,
          from: FaultStatus[1],
          to: FaultStatus[2]
        });
      }
      writeAudit(tx, actor, "RepairTicket", "restore", "RepairTicket", ticket.ticket_no, {
        ticketNo: ticket.ticket_no,
        crewName: crew?.name ?? "",
        assetCode: asset?.asset_code ?? "",
        healthStatus: RESTORED_HEALTH
      });
      if (asset) {
        writeAudit(tx, actor, "GridAsset", "healthChange", "GridAsset", asset.asset_code, {
          assetCode: asset.asset_code,
          from: healthBefore ?? "",
          to: RESTORED_HEALTH
        });
      }

      return this.list().find((row) => row.id === ticket.id);
    });
  }
};
