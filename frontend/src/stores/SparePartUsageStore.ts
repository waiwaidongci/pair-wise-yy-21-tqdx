import { defineStore } from "pinia";
import { listSparePartUsage } from "../api/SparePartUsage";
import type { SparePartUsage } from "../types/SparePartUsage";

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: () => ({ rows: [] as SparePartUsage[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listSparePartUsage();
      } finally {
        this.loading = false;
      }
    }
  }
});
