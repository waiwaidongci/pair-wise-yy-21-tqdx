import { defineStore } from "pinia";
import { listFaultReport, registerFaultReport } from "../api/FaultReport";
import type { FaultReport, FaultReportForm } from "../types/FaultReport";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";

// 报修登记后需要同时刷新故障/工单/资产（健康联动）/班组，刷新动作集中在这里编排
import { useRepairTicketStore } from "./RepairTicketStore";
import { useGridAssetStore } from "./GridAssetStore";
import { useCrewStore } from "./CrewStore";

export const useFaultReportStore = defineStore("faultReport", {
  state: () => ({ rows: [] as FaultReport[], loading: false, submitting: false }),
  getters: {
    pending: (state) => state.rows.filter((row) => row.status === "WAIT_DISPATCH"),
    open: (state) => state.rows.filter((row) => !["RESTORED", "CLOSED"].includes(row.status)),
    byId: (state) => (id: number) => state.rows.find((row) => row.id === id)
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
    async register(form: FaultReportForm) {
      this.submitting = true;
      try {
        const created = await registerFaultReport(form);
        console.info(
          renderLog(LOG_TEMPLATES.FaultReport.create, {
            asset_id: created.asset_id,
            fault_type: created.fault_type
          })
        );
        await this.refreshChain();
        return created;
      } finally {
        this.submitting = false;
      }
    },
    async refreshChain() {
      // 规则联动产生的工单与健康状态变化，通过整链刷新在页面可见
      await Promise.all([
        this.load(),
        useRepairTicketStore().load(),
        useGridAssetStore().load(),
        useCrewStore().load()
      ]);
    }
  }
});
