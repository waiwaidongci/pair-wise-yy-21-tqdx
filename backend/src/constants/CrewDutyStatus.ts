/** 班组值班状态：待命 / 离线（占用与否由 current_ticket_id 判定） */
export const CrewDutyStatus = ["ON_DUTY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
