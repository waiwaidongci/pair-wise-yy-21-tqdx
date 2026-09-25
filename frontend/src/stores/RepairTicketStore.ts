import { defineStore } from "pinia";
import {
  listRepairTicket,
  getDispatchPlan,
  dispatchTicket,
  advanceTicket,
  restoreTicket
} from "../api/RepairTicket";
import type { RepairTicket } from "../types/RepairTicket";
import type { DispatchPlan } from "../types/Dispatch";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";
import { useFaultReportStore } from "./FaultReportStore";
import { useGridAssetStore } from "./GridAssetStore";
import { useCrewStore } from "./CrewStore";

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({
    rows: [] as RepairTicket[],
    plans: {} as Record<number, DispatchPlan>,
    loading: false,
    acting: false
  }),
  getters: {
    pending: (state) => state.rows.filter((row) => row.status === "WAIT_DISPATCH"),
    open: (state) => state.rows.filter((row) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(row.status)),
    byId: (state) => (id: number) => state.rows.find((row) => row.id === id)
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
    async loadPlan(ticketId: number) {
      this.plans[ticketId] = await getDispatchPlan(ticketId);
    },
    async dispatch(ticketId: number, teamId: number) {
      this.acting = true;
      try {
        const updated = await dispatchTicket(ticketId, teamId);
        console.info(renderLog(LOG_TEMPLATES.RepairTicket.dispatch, { ticket_id: ticketId, crew_id: teamId }));
        // 派工后：故障单、工单、班组占用同时更新，统一刷新整链
        await this.refreshChain();
        return updated;
      } finally {
        this.acting = false;
      }
    },
    async advance(ticketId: number) {
      this.acting = true;
      try {
        const updated = await advanceTicket(ticketId);
        console.info(
          renderLog(LOG_TEMPLATES.RepairTicket.status, { ticket_id: ticketId, from: "x", to: updated.status })
        );
        await this.refreshChain();
        return updated;
      } finally {
        this.acting = false;
      }
    },
    async restore(ticketId: number) {
      this.acting = true;
      try {
        const updated = await restoreTicket(ticketId);
        console.info(renderLog(LOG_TEMPLATES.RepairTicket.restore, { ticket_id: ticketId }));
        // 复电后：班组释放 + 资产健康恢复 NORMAL，整链刷新
        await this.refreshChain();
        return updated;
      } finally {
        this.acting = false;
      }
    },
    async refreshChain() {
      await Promise.all([
        this.load(),
        useFaultReportStore().load(),
        useGridAssetStore().load(),
        useCrewStore().load()
      ]);
    }
  }
});
