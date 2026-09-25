import { defineStore } from "pinia";
import { listGridAsset } from "../api/GridAsset";
import type { GridAsset } from "../types/GridAsset";

export const useGridAssetStore = defineStore("gridAsset", {
  state: () => ({ rows: [] as GridAsset[], loading: false }),
  getters: {
    feederLines: (state) => [...new Set(state.rows.map((row) => row.feeder_line))],
    byId: (state) => (id: number) => state.rows.find((row) => row.id === id)
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
