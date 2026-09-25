import type { FaultType } from "./FaultType";
import { AssetHealthStatusText } from "./AssetHealthStatus";

/** 与后端 healthRules 同义的前端映射，用于登记页预判资产健康变化。 */
export const FAULT_HEALTH_TEXT: Record<FaultType, string> = {
  OUTAGE: AssetHealthStatusText.DANGEROUS,
  VOLTAGE_LOW: AssetHealthStatusText.DEGRADED,
  TRIP: AssetHealthStatusText.WATCH,
  EQUIPMENT_DAMAGE: AssetHealthStatusText.DANGEROUS,
  SAFETY_RISK: AssetHealthStatusText.DANGEROUS
};
