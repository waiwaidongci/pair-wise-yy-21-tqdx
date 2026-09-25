<script setup lang="ts">
import { computed } from "vue";
import { TicketStatus, TicketStatusText } from "../../constants/TicketStatus";
import { AssetHealthStatus, AssetHealthStatusText, AssetHealthStatusTone } from "../../constants/AssetHealthStatus";
import { FaultStatus, FaultStatusText } from "../../constants/FaultStatus";
import { CrewDutyStatus, CrewDutyStatusText } from "../../constants/CrewDutyStatus";

const props = defineProps<{ value: string; kind?: "ticket" | "health" | "fault" | "duty" }>();

const toneMap: Record<string, Record<string, string>> = {
  ticket: {
    WAIT_DISPATCH: "idle",
    ASSIGNED: "info",
    ARRIVED: "info",
    REPAIRING: "warn",
    RESTORED: "ok",
    CLOSED: "muted"
  }
};

const text = computed(() => {
  switch (props.kind) {
    case "health":
      return AssetHealthStatusText[props.value as AssetHealthStatus] ?? props.value;
    case "fault":
      return FaultStatusText[props.value as FaultStatus] ?? props.value;
    case "duty":
      return CrewDutyStatusText[props.value as CrewDutyStatus] ?? props.value;
    default:
      return TicketStatusText[props.value as TicketStatus] ?? props.value;
  }
});

const tone = computed(() => {
  if (props.kind === "health") return AssetHealthStatusTone[props.value as AssetHealthStatus] ?? "muted";
  if (props.kind === "duty") return props.value === "ON_DUTY" ? "ok" : "muted";
  if (props.kind === "fault") {
    return { PENDING: "idle", PROCESSING: "warn", RESOLVED: "ok" }[props.value] ?? "muted";
  }
  return toneMap.ticket[props.value] ?? "muted";
});
</script>

<template>
  <span class="badge" :class="tone">{{ text }}</span>
</template>
