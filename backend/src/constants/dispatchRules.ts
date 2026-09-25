/**
 * 派工技能匹配规则（规则层唯一事实来源）：
 * 故障类型 -> 承接该故障班组必须具备的技能标签。
 * 班组 skill_tags 命中任一要求技能即可。
 */
import { FaultType } from "./FaultType";

export const FAULT_SKILL_RULE: Record<FaultType, string[]> = {
  OUTAGE: ["OUTAGE"],
  VOLTAGE_LOW: ["VOLTAGE_LOW", "TRANSFORMER"],
  TRIP: ["TRIP"],
  EQUIPMENT_DAMAGE: ["EQUIPMENT_DAMAGE"],
  SAFETY_RISK: ["SAFETY_RISK", "HOT_LINE"]
};

export function requiredSkillsOf(faultType: string): string[] {
  return FAULT_SKILL_RULE[faultType as FaultType] ?? [];
}
