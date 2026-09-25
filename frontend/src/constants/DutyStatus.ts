export const DutyStatus = ["ON_DUTY","OFF_DUTY","RESTING"] as const;
export type DutyStatus = (typeof DutyStatus)[number];

export const DutyStatusText: Record<DutyStatus, string> = {
  ON_DUTY: "待命",
  OFF_DUTY: "休班",
  RESTING: "休整"
};
