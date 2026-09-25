import type { SparePartUsage } from "../models/SparePartUsage";
import type { RepairTicket } from "../models/RepairTicket";

export function createSparePartUsageDto(part: SparePartUsage, ticket?: RepairTicket) {
  return {
    ...part,
    ticket_no: ticket?.ticket_no ?? null
  };
}
