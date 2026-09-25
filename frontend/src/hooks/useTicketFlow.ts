import type { RepairTicket } from "../types/RepairTicket";
import { useRepairTicketStore } from "../stores/RepairTicketStore";

/** 工单流转动作与按钮可用性：已派工→到场→抢修中→复电确认。 */
export function useTicketFlow() {
  const store = useRepairTicketStore();

  const canArrive = (ticket: RepairTicket) => ticket.status === "ASSIGNED";
  const canRepair = (ticket: RepairTicket) => ticket.status === "ARRIVED";
  const canRestore = (ticket: RepairTicket) => ticket.status === "REPAIRING";

  return {
    arrive: (id: number) => store.arrive(id),
    repairing: (id: number) => store.repairing(id),
    restore: (id: number) => store.restore(id),
    canArrive,
    canRepair,
    canRestore
  };
}
