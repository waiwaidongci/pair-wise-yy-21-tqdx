import { defineStore } from "pinia";
import {
  listRepairTicket,
  arriveTicket,
  repairTicket as repairTicketApi,
  restoreTicket,
  dispatchTicket
} from "../api/RepairTicket";
import type { RepairTicket } from "../types/RepairTicket";

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({ rows: [] as RepairTicket[], loading: false }),
  getters: {
    openTickets: (state) =>
      state.rows.filter((ticket) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(ticket.status)),
    restoredCount: (state) => state.rows.filter((ticket) => ticket.status === "RESTORED" || ticket.status === "CLOSED").length
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listRepairTicket();
      } finally {
        this.loading = false;
      }
    },
    async dispatch(faultReportId: number, teamId?: number) {
      const ticket = await dispatchTicket(faultReportId, teamId);
      await this.load();
      return ticket;
    },
    async arrive(id: number) {
      await arriveTicket(id);
      await this.load();
    },
    async repairing(id: number) {
      await repairTicketApi(id);
      await this.load();
    },
    async restore(id: number) {
      await restoreTicket(id);
      await this.load();
    }
  }
});
