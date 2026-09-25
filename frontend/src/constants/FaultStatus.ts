/** 故障单状态文案。 */
export const FaultStatus = ["PENDING", "PROCESSING", "RESOLVED"] as const;
export type FaultStatus = (typeof FaultStatus)[number];

export const FaultStatusText: Record<FaultStatus, string> = {
  PENDING: "待派工",
  PROCESSING: "抢修中",
  RESOLVED: "已复电"
};
