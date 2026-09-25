/** 技能标签 / 故障类型的中文展示文案，错误消息与页面共用。 */
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
