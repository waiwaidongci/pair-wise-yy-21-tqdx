import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { createSparePartUsageDto } from "../constructors/SparePartUsageDtoFactory";

export const sparePartUsageService = {
  list() {
    return sparePartUsageRepository.findAll().map((part) => {
      const ticket = repairTicketRepository.findById(part.ticket_id);
      return createSparePartUsageDto(part, ticket);
    });
  }
};
