import type { Crew } from "../models/Crew";
import type { RepairTicket } from "../models/RepairTicket";
import { CrewDutyStatus } from "../constants/CrewDutyStatus";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES, renderMessage } from "../constants/errorMessages";
import { skillLabel } from "../constants/skillLabels";
import type { BlockReason, CrewDispatchProfile } from "../types/DispatchDecision";

interface EvaluateContext {
  requiredSkills: string[];
  ticketNoOf: (ticketId: number | null) => string | null;
}

/**
 * 派工资格规则（纯函数，规则层核心）：
 * 1. 班组必须待命（ON_DUTY）；
 * 2. 技能标签必须命中故障所需技能；
 * 3. current_ticket_id 非空（已有未结工单占用）则不能接单。
 * 返回全部不满足项，页面据此逐条展示「哪里没满足」。
 */
export function evaluateCrew(crew: Crew, ctx: EvaluateContext): BlockReason[] {
  const reasons: BlockReason[] = [];

  if (crew.duty_status !== CrewDutyStatus[0]) {
    reasons.push({
      code: ERROR_CODES.CREW_OFF_DUTY,
      message: renderMessage(ERROR_MESSAGES.CREW_OFF_DUTY, {
        crewName: crew.name,
        dutyStatus: crew.duty_status === "OFF_DUTY" ? "离线休整" : crew.duty_status
      })
    });
  }

  const matched = crew.skill_tags.filter((tag) => ctx.requiredSkills.includes(tag));
  if (matched.length === 0) {
    reasons.push({
      code: ERROR_CODES.CREW_SKILL_MISMATCH,
      message: renderMessage(ERROR_MESSAGES.CREW_SKILL_MISMATCH, {
        crewName: crew.name,
        crewSkills: crew.skill_tags.map(skillLabel).join("、") || "（无）",
        faultType: ctx.requiredSkills.map(skillLabel).join("、"),
        requiredSkills: ctx.requiredSkills.map(skillLabel).join("、")
      })
    });
  }

  const ticketNo = ctx.ticketNoOf(crew.current_ticket_id);
  if (crew.current_ticket_id != null) {
    reasons.push({
      code: ERROR_CODES.CREW_BUSY,
      message: renderMessage(ERROR_MESSAGES.CREW_BUSY, {
        crewName: crew.name,
        ticketNo: ticketNo ?? `#${crew.current_ticket_id}`
      })
    });
  }

  return reasons;
}

/** 批量评估，eligible 为 true 的班组可接单。 */
export function buildDispatchProfiles(
  crews: Crew[],
  requiredSkills: string[],
  tickets: RepairTicket[]
): CrewDispatchProfile[] {
  const ticketMap = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const ticketNoOf = (ticketId: number | null) =>
    ticketId == null ? null : ticketMap.get(ticketId)?.ticket_no ?? null;

  return crews.map((crew) => {
    const reasons = evaluateCrew(crew, { requiredSkills, ticketNoOf });
    return {
      id: crew.id,
      name: crew.name,
      skill_tags: crew.skill_tags,
      duty_status: crew.duty_status,
      current_ticket_id: crew.current_ticket_id,
      current_ticket_no: ticketNoOf(crew.current_ticket_id),
      eligible: reasons.length === 0,
      reasons
    };
  });
}
