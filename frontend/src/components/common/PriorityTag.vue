<script setup lang="ts">
import { computed } from "vue";
import { formatSeverity } from "../../utils/formatters";

const props = defineProps<{ value: string }>();
const text = computed(() => formatSeverity(props.value));
</script>

<template>
  <span class="priority" :class="`priority-${value.toLowerCase()}`">{{ text }}</span>
</template>
