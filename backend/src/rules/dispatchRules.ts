import type { Crew } from "../models/Crew";
import { requiredSkillOf } from "./skillMatrix";

export type DispatchBlockCode = "SKILL_NOT_MATCHED" | "CREW_OFF_DUTY" | "CREW_BUSY";

export interface CrewDispatchCheck {
  crew_id: number;
  crew_name: string;
  eligible: boolean;
  reasons: DispatchBlockCode[];
  required_skill: string;
  required_skill_label: string;
  actual_skills: string[];
  duty_status: string;
  current_ticket_id: number | null;
}

/**
 * 派工资格规则（纯函数，不落库、不发请求）：
 * 1. 班组技能标签必须覆盖故障类型对应的必备技能；
 * 2. 班组必须处于待命 ON_DUTY 状态；
 * 3. 班组不存在未结工单（current_ticket_id 为空）。
 * 三条任一不满足即不可接单，并逐条给出阻断码，页面直接展示原因。
 */
export function evaluateCrewForFault(crew: Crew, faultType: string): CrewDispatchCheck {
  const required = requiredSkillOf(faultType);
  const reasons: DispatchBlockCode[] = [];
  const skills = crew.skill_tags;

  if (!skills.includes(required.skill)) reasons.push("SKILL_NOT_MATCHED");
  if (crew.duty_status !== "ON_DUTY") reasons.push("CREW_OFF_DUTY");
  if (crew.current_ticket_id !== null) reasons.push("CREW_BUSY");

  return {
    crew_id: crew.id,
    crew_name: crew.name,
    eligible: reasons.length === 0,
    reasons,
    required_skill: required.skill,
    required_skill_label: required.label,
    actual_skills: skills,
    duty_status: crew.duty_status,
    current_ticket_id: crew.current_ticket_id
  };
}

export function evaluateDispatch(crews: Crew[], faultType: string): {
  required_skill: string;
  required_skill_label: string;
  checks: CrewDispatchCheck[];
  eligibleCrews: Crew[];
} {
  const required = requiredSkillOf(faultType);
  const checks = crews.map((crew) => evaluateCrewForFault(crew, faultType));
  const eligibleIds = checks.filter((item) => item.eligible).map((item) => item.crew_id);
  return {
    required_skill: required.skill,
    required_skill_label: required.label,
    checks,
    eligibleCrews: crews.filter((crew) => eligibleIds.includes(crew.id))
  };
}
