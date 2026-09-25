/** 技能标签中文文案，与后端 skillLabels 保持同义。 */
export const SKILL_LABELS: Record<string, string> = {
  OUTAGE: "停电抢修",
  VOLTAGE_LOW: "低压治理",
  TRANSFORMER: "变压器检修",
  TRIP: "跳闸处置",
  EQUIPMENT_DAMAGE: "设备损坏更换",
  SAFETY_RISK: "隐患排险",
  HOT_LINE: "带电作业",
  LINE_REPAIR: "线路检修",
  PATROL: "巡视巡查"
};

export function skillLabel(tag: string): string {
  return SKILL_LABELS[tag] ?? tag;
}

/** 严重程度文案与配色。 */
export const SEVERITY_TEXT: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  CRITICAL: "紧急"
};
