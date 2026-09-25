import { defineStore } from "pinia";
import { listCrew, listCrewOccupancy } from "../api/Crew";
import type { Crew } from "../types/Crew";

export const useCrewStore = defineStore("crew", {
  state: () => ({ rows: [] as Crew[], occupancy: [] as Crew[], loading: false }),
  getters: {
    byId: (state) => (id: number | null | undefined) =>
      id == null ? undefined : state.rows.find((row) => row.id === id)
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        const [rows, occupied] = await Promise.all([listCrew(), listCrewOccupancy()]);
        this.rows = rows;
        this.occupancy = occupied;
      } finally {
        this.loading = false;
      }
    }
  }
});
