<script setup lang="ts">
import { computed } from "vue";
import { SEVERITY_TEXT } from "../../constants/skillLabels";

const props = defineProps<{ value: string }>();
const text = computed(() => SEVERITY_TEXT[props.value] ?? props.value);
const tone = computed(() => {
  if (props.value === "HIGH" || props.value === "CRITICAL") return "danger";
  if (props.value === "MEDIUM") return "warn";
  return "muted";
});
</script>

<template>
  <span class="badge" :class="tone">{{ text }}优先级</span>
</template>
