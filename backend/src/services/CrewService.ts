import { crewRepository } from "../repositories/CrewRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { createCrewDto } from "../constructors/CrewDtoFactory";

export const crewService = {
  list() {
    const tickets = repairTicketRepository.findAll();
    return crewRepository.findAll().map((crew) => {
      const ticketNo =
        crew.current_ticket_id == null
          ? null
          : tickets.find((ticket) => ticket.id === crew.current_ticket_id)?.ticket_no ?? null;
      return createCrewDto(crew, ticketNo);
    });
  }
};
