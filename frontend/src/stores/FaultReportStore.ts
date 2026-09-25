import { defineStore } from "pinia";
import { listFaultReport, createFaultReport } from "../api/FaultReport";
import type { FaultReport, CreateFaultPayload } from "../types/FaultReport";

export const useFaultReportStore = defineStore("faultReport", {
  state: () => ({ rows: [] as FaultReport[], loading: false }),
  getters: {
    pending: (state) => state.rows.filter((fault) => fault.status === "PENDING"),
    processing: (state) => state.rows.filter((fault) => fault.status === "PROCESSING"),
    resolved: (state) => state.rows.filter((fault) => fault.status === "RESOLVED")
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listFaultReport();
      } finally {
        this.loading = false;
      }
    },
    async register(payload: CreateFaultPayload) {
      const fault = await createFaultReport(payload);
      await this.load();
      return fault;
    }
  }
});
