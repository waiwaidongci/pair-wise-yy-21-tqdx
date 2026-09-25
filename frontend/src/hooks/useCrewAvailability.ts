import { ref } from "vue";
import { fetchCandidates } from "../api/RepairTicket";
import { extractReasons } from "../api/client";
import type { CrewAvailability } from "../types/Crew";

/**
 * 班组可派评估：按故障拉取候选班组，
 * 暴露阻断原因与当前占用，供派工面板逐条展示。
 */
export function useCrewAvailability() {
  const availability = ref<CrewAvailability | null>(null);
  const loading = ref(false);
  const errorMessages = ref<string[]>([]);

  async function evaluate(faultReportId: number) {
    loading.value = true;
    errorMessages.value = [];
    try {
      availability.value = await fetchCandidates(faultReportId);
    } catch (error) {
      errorMessages.value = extractReasons(error);
      availability.value = null;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    availability.value = null;
    errorMessages.value = [];
  }

  return { availability, loading, errorMessages, evaluate, reset };
}
