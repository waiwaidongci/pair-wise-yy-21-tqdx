<script setup lang="ts">
import { computed } from "vue";
import type { Crew } from "../../types/Crew";
import type { DispatchOption } from "../../types/Dispatch";
import { formatSkills, formatDuty } from "../../utils/formatters";
import StatusBadge from "./StatusBadge.vue";
import { BLOCK_REASON_TEXT } from "../../hooks/useCrewAvailability";

const props = defineProps<{
  crew?: Crew;
  option?: DispatchOption;
  selectable?: boolean;
  selected?: boolean;
  blocked?: boolean;
}>();

const emit = defineEmits<{ (e: "select", id: number): void }>();

const name = computed(() => props.option?.crew_name ?? props.crew?.name ?? "—");
const skills = computed(() => props.option?.actual_skills ?? props.crew?.skill_tags ?? []);
const duty = computed(() => props.option?.duty_status ?? props.crew?.duty_status ?? "");
const ticketId = computed(() => props.option?.current_ticket_id ?? props.crew?.current_ticket_id ?? null);
const occupied = computed(() => ticketId.value !== null);
const eligible = computed(() => (props.option ? props.option.eligible : !occupied.value));
const reasons = computed(() => props.option?.reasons ?? (occupied.value ? ["CREW_BUSY" as const] : []));
const clickable = computed(() => props.selectable && eligible.value);
</script>

<template>
  <div
    class="crew-card"
    :class="{ selectable: clickable, selected, dimmed: !eligible }"
    @click="clickable && emit('select', (option?.crew_id ?? crew?.id)!)"
  >
    <div class="crew-head">
      <strong>{{ name }}</strong>
      <StatusBadge :value="duty" kind="duty" />
    </div>
    <div class="crew-skills">技能：{{ formatSkills(skills) }}</div>
    <div class="crew-foot">
      <span v-if="occupied" class="occupy busy">占用中 · 工单 #{{ ticketId }}</span>
      <span v-else class="occupy free">空闲可派</span>
      <template v-if="option && !eligible">
        <span v-for="reason in reasons" :key="reason" class="block-reason">⛔ {{ BLOCK_REASON_TEXT[reason] }}</span>
      </template>
    </div>
  </div>
</template>
