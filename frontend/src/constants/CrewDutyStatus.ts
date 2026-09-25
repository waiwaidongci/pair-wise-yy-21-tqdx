/** 班组值班状态文案。 */
export const CrewDutyStatus = ["ON_DUTY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];

export const CrewDutyStatusText: Record<CrewDutyStatus, string> = {
  ON_DUTY: "待命",
  OFF_DUTY: "离线"
};
