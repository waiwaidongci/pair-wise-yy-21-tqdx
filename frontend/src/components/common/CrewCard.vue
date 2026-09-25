<script setup lang="ts">
import type { CrewDispatchProfile } from "../../types/Crew";
import { skillLabel } from "../../constants/skillLabels";
import StatusBadge from "./StatusBadge.vue";

const props = defineProps<{
  crew: CrewDispatchProfile;
  selectable?: boolean;
}>();
const emit = defineEmits<{ (e: "select", id: number): void }>();
</script>

<template>
  <article class="crew-card" :class="{ blocked: !crew.eligible }">
    <header>
      <strong>{{ crew.name }}</strong>
      <StatusBadge :value="crew.duty_status" kind="duty" />
    </header>
    <p class="skills">
      <span v-for="tag in crew.skill_tags" :key="tag" class="skill">{{ skillLabel(tag) }}</span>
    </p>
    <p class="occupy">
      当前占用：
      <template v-if="crew.current_ticket_no">
        <b class="danger-text">{{ crew.current_ticket_no }}</b>（未结，不可接单）
      </template>
      <b v-else class="ok-text">空闲</b>
    </p>
    <ul v-if="crew.reasons.length" class="reasons">
      <li v-for="(reason, index) in crew.reasons" :key="index">⚠ {{ reason.message }}</li>
    </ul>
    <button v-if="selectable && crew.eligible" class="primary small" @click="emit('select', crew.id)">
      派给该班组
    </button>
    <p v-else-if="crew.eligible" class="ok-text">满足接单条件</p>
  </article>
</template>
