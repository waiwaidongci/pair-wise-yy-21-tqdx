/** 故障报修单状态：待派工 / 抢修中 / 已复电 */
export const FaultStatus = ["PENDING", "PROCESSING", "RESOLVED"] as const;
export type FaultStatus = (typeof FaultStatus)[number];
