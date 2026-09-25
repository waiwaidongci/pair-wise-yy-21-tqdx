export const FaultType = ["OUTAGE","VOLTAGE_LOW","TRIP","EQUIPMENT_DAMAGE","SAFETY_RISK"] as const;
export type FaultType = (typeof FaultType)[number];

export function isFaultType(value: unknown): value is FaultType {
  return typeof value === "string" && (FaultType as readonly string[]).includes(value);
}
