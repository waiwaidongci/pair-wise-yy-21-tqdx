<script setup lang="ts">
import { computed } from "vue";
import { formatStatus, formatHealth, formatDuty } from "../../utils/formatters";

const props = defineProps<{ value: string; kind?: "ticket" | "health" | "duty" }>();

const text = computed(() => {
  if (props.kind === "health") return formatHealth(props.value);
  if (props.kind === "duty") return formatDuty(props.value);
  return formatStatus(props.value);
});

const toneClass = computed(() => `tone-${(props.kind ?? "ticket").toLowerCase()}-${props.value.toLowerCase()}`);
</script>

<template>
  <span class="badge" :class="toneClass">{{ text }}</span>
</template>
