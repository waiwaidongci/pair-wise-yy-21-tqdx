// 班组待命状态：只有 ON_DUTY 待命班组才具备接单资格
export const DutyStatus = ["ON_DUTY", "OFF_DUTY", "RESTING"] as const;
export type DutyStatus = (typeof DutyStatus)[number];

export const DutyStatusText: Record<DutyStatus, string> = {
  ON_DUTY: "待命",
  OFF_DUTY: "休班",
  RESTING: "休整"
};
