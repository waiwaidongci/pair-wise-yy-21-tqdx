import { TicketStatus } from "./TicketStatus";

/**
 * 未结工单状态集合：处于这些状态的工单仍然占用班组。
 * RESTORED / CLOSED 视为已结，复电确认后释放班组。
 */
export const OPEN_TICKET_STATUSES: TicketStatus[] = [
  "WAIT_DISPATCH",
  "ASSIGNED",
  "ARRIVED",
  "REPAIRING"
];

export function isOpenTicketStatus(status: string): boolean {
  return OPEN_TICKET_STATUSES.includes(status as TicketStatus);
}
