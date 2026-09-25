import { defineStore } from "pinia";
import { listGridAsset } from "../api/GridAsset";
import type { GridAsset } from "../types/GridAsset";

export const useGridAssetStore = defineStore("gridAsset", {
  state: () => ({ rows: [] as GridAsset[], loading: false }),
  getters: {
    abnormalCount: (state) =>
      state.rows.filter((asset) => asset.health_status !== "NORMAL").length
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listGridAsset();
      } finally {
        this.loading = false;
      }
    }
  }
});
