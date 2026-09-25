import { defineStore } from "pinia";
import { listCrew } from "../api/Crew";
import type { Crew } from "../types/Crew";

export const useCrewStore = defineStore("crew", {
  state: () => ({ rows: [] as Crew[], loading: false }),
  getters: {
    onDutyCount: (state) => state.rows.filter((crew) => crew.duty_status === "ON_DUTY").length,
    occupiedCount: (state) => state.rows.filter((crew) => crew.current_ticket_id != null).length,
    freeCount: (state) => state.rows.filter((crew) => crew.available).length
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listCrew();
      } finally {
        this.loading = false;
      }
    }
  }
});
