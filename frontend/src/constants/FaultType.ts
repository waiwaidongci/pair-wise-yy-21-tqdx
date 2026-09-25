export const FaultType = ["OUTAGE","VOLTAGE_LOW","TRIP","EQUIPMENT_DAMAGE","SAFETY_RISK"] as const;
export type FaultType = (typeof FaultType)[number];

export const FaultTypeText: Record<FaultType, string> = {
  OUTAGE: "停电",
  VOLTAGE_LOW: "电压偏低",
  TRIP: "开关跳闸",
  EQUIPMENT_DAMAGE: "设备损坏",
  SAFETY_RISK: "安全隐患"
};

// 规则层在后端 rules/skillMatrix，前端只保留展示文案镜像
export const SkillText: Record<string, string> = {
  OUTAGE_REPAIR: "停电抢修",
  LINE_MAINT: "线路检修",
  EQUIP_REPAIR: "设备检修",
  HOTLINE_MAINT: "带电作业"
};
