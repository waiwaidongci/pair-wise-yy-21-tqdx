import { FaultType } from "../constants/FaultType";
import { AssetHealthStatus } from "../constants/AssetHealthStatus";

/**
 * 故障类型 -> 必备抢修技能
 * 规则集中维护：新增故障类型或调整班组技能口径时，只改这里，
 * 派工候选、阻断原因、页面提示全部经由本规则计算。
 */
export const FAULT_SKILL_MATRIX: Record<FaultType, { skill: string; label: string }> = {
  OUTAGE: { skill: "OUTAGE_REPAIR", label: "停电抢修" },
  VOLTAGE_LOW: { skill: "LINE_MAINT", label: "线路检修" },
  TRIP: { skill: "LINE_MAINT", label: "线路检修" },
  EQUIPMENT_DAMAGE: { skill: "EQUIP_REPAIR", label: "设备检修" },
  SAFETY_RISK: { skill: "HOTLINE_MAINT", label: "带电作业" }
};

export const SKILL_LABELS: Record<string, string> = Object.values(FAULT_SKILL_MATRIX).reduce(
  (acc, item) => ({ ...acc, [item.skill]: item.label }),
  {} as Record<string, string>
);

export const requiredSkillOf = (faultType: string): { skill: string; label: string } =>
  FAULT_SKILL_MATRIX[faultType as FaultType] ?? { skill: "UNKNOWN", label: "未知技能" };

/**
 * 登记故障时按严重等级同步劣化资产健康。
 * 复电确认时统一恢复为 NORMAL，规则与动作分别落在 rules / service。
 */
export const SEVERITY_HEALTH_MATRIX: Record<string, AssetHealthStatus> = {
  LOW: AssetHealthStatus[1], // WATCH
  MEDIUM: AssetHealthStatus[2], // DEGRADED
  HIGH: AssetHealthStatus[3], // DANGEROUS
  CRITICAL: AssetHealthStatus[3] // DANGEROUS
};

export const healthOnFault = (severity: string): AssetHealthStatus =>
  SEVERITY_HEALTH_MATRIX[severity] ?? AssetHealthStatus[2];

// 工单一经派工，在复电/关闭前都算"未结"，班组不得再接新单
export const OPEN_TICKET_STATUSES = ["ASSIGNED", "ARRIVED", "REPAIRING"] as const;
