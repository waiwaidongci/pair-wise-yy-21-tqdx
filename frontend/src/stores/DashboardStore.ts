import { defineStore } from "pinia";
import { getDashboardOverview } from "../api/Dashboard";
import type { DashboardOverview } from "../types/Dispatch";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    overview: null as DashboardOverview | null,
    loading: false
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.overview = await getDashboardOverview();
      } finally {
        this.loading = false;
      }
    }
  }
});
