import { AssetHealthStatus } from "./AssetHealthStatus";
import type { FaultType } from "./FaultType";

/**
 * 登记故障时资产健康的降级规则：
 * 故障类型 -> 受影响资产的健康状态（报修登记即关联资产并降级）。
 */
export const FAULT_HEALTH_RULE: Record<FaultType, (typeof AssetHealthStatus)[number]> = {
  OUTAGE: "DANGEROUS",
  VOLTAGE_LOW: "DEGRADED",
  TRIP: "WATCH",
  EQUIPMENT_DAMAGE: "DANGEROUS",
  SAFETY_RISK: "DANGEROUS"
};

/** 复电确认后资产恢复的目标健康状态。 */
export const RESTORED_HEALTH: (typeof AssetHealthStatus)[number] = "NORMAL";
