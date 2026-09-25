<script setup lang="ts">
import { ref, watch } from "vue";
import type { RepairTicket } from "../../types/RepairTicket";
import type { DispatchPlan } from "../../types/Dispatch";
import type { ApiError } from "../../api/client";
import { useRepairTicketStore } from "../../stores/RepairTicketStore";
import { useCrewAvailability, BLOCK_REASON_TEXT } from "../../hooks/useCrewAvailability";
import CrewCard from "./CrewCard.vue";
import { formatFaultType } from "../../utils/formatters";

const props = defineProps<{ ticket: RepairTicket }>();
const emit = defineEmits<{ (e: "done"): void }>();

const ticketStore = useRepairTicketStore();
const plan = ref<DispatchPlan | null>(ticketStore.plans[props.ticket.id] ?? null);
const selectedCrew = ref<number | null>(null);
const errorMsg = ref<string | null>(null);
const loadingPlan = ref(false);

const options = () => plan.value?.options ?? [];
const { availableOptions, blockedOptions } = useCrewAvailability(options);

const selectedName = () =>
  plan.value?.options.find((o) => o.crew_id === selectedCrew.value)?.crew_name ?? "";

async function openPlan() {
  loadingPlan.value = true;
  errorMsg.value = null;
  try {
    await ticketStore.loadPlan(props.ticket.id);
    plan.value = ticketStore.plans[props.ticket.id];
    selectedCrew.value = null;
  } finally {
    loadingPlan.value = false;
  }
}

// 初始展开一次，保证进页面就能看到阻断原因
openPlan();

watch(
  () => props.ticket.status,
  () => {
    plan.value = ticketStore.plans[props.ticket.id] ?? null;
  }
);

async function confirmDispatch() {
  if (selectedCrew.value == null) return;
  errorMsg.value = null;
  try {
    await ticketStore.dispatch(props.ticket.id, selectedCrew.value);
    emit("done");
  } catch (err) {
    // 后端规则复核失败（并发占用等），把阻断原因展示在面板上
    errorMsg.value = (err as ApiError).message;
    await openPlan();
  }
}
</script>

<template>
  <div class="dispatch-panel">
    <div class="dispatch-head">
      <span>故障类型：<strong>{{ formatFaultType(ticket.fault_type ?? "") }}</strong></span>
      <button class="btn btn-ghost" :disabled="loadingPlan" @click="openPlan">
        {{ loadingPlan ? "分析中…" : "刷新派工分析" }}
      </button>
    </div>

    <div v-if="plan" class="dispatch-body">
      <p class="skill-need">
        所需技能：<strong>{{ plan.required_skill_label }}</strong>
        ｜ 可派班组 {{ availableOptions().length }} 个 / 阻断 {{ blockedOptions().length }} 个
      </p>

      <div v-if="!plan.has_eligible_crew" class="block-banner">
        ⛔ 全员阻断：{{ plan.blocked_reason }}
      </div>

      <div class="crew-grid">
        <CrewCard
          v-for="option in plan.options"
          :key="option.crew_id"
          :option="option"
          selectable
          :selected="selectedCrew === option.crew_id"
          @select="selectedCrew = $event"
        />
      </div>

      <details v-if="blockedOptions().length" class="block-detail">
        <summary>查看派工阻断明细</summary>
        <ul>
          <li v-for="option in blockedOptions()" :key="option.crew_id">
            {{ option.crew_name }}：
            <span v-for="reason in option.reasons" :key="reason" class="block-reason">
              {{ BLOCK_REASON_TEXT[reason] }}（当前占用工单 #{{ option.current_ticket_id ?? "无" }}）
            </span>
          </li>
        </ul>
      </details>

      <p v-if="errorMsg" class="dispatch-error">⛔ {{ errorMsg }}</p>

      <div class="dispatch-actions">
        <button
          class="btn btn-primary"
          :disabled="selectedCrew == null || ticketStore.acting"
          @click="confirmDispatch"
        >
          {{ ticketStore.acting ? "派工中…" : `确认派工给 ${selectedName()}` }}
        </button>
      </div>
    </div>
  </div>
</template>
