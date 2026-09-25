<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useCrewStore } from "../stores/CrewStore";
import { useTicketFlow } from "../hooks/useTicketFlow";
import type { ApiError } from "../api/client";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import CrewCard from "../components/common/CrewCard.vue";
import DispatchPanel from "../components/common/DispatchPanel.vue";
import TimelineList, { type TimelineItem } from "../components/common/TimelineList.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { formatDate } from "../utils/formatters";

const ticketStore = useRepairTicketStore();
const crewStore = useCrewStore();
const { rows, acting } = storeToRefs(ticketStore);
const { occupancy } = storeToRefs(crewStore);

const expanded = ref<Set<number>>(new Set());
const actionError = ref<Record<number, string>>({});

onMounted(async () => {
  await ticketStore.load();
  await crewStore.load();
});

const pending = computed(() => rows.value.filter((row) => row.status === "WAIT_DISPATCH"));
const inProgress = computed(() =>
  rows.value.filter((row) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(row.status))
);
const finished = computed(() =>
  rows.value.filter((row) => ["RESTORED", "CLOSED"].includes(row.status))
);

function toggle(id: number) {
  expanded.value.has(id) ? expanded.value.delete(id) : expanded.value.add(id);
}

async function advance(id: number) {
  actionError.value[id] = "";
  try {
    await ticketStore.advance(id);
  } catch (err) {
    actionError.value[id] = (err as ApiError).message;
  }
}

async function restore(id: number) {
  actionError.value[id] = "";
  if (!window.confirm("确认复电？将同时释放班组占用，并把关联资产健康恢复为正常。")) return;
  try {
    await ticketStore.restore(id);
  } catch (err) {
    actionError.value[id] = (err as ApiError).message;
  }
}

function flowOf(id: number) {
  return useTicketFlow(() => ticketStore.byId(id));
}

function timeline(id: number): TimelineItem[] {
  const ticket = ticketStore.byId(id);
  if (!ticket) return [];
  const order = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING", "RESTORED"];
  const idx = order.indexOf(ticket.status);
  return [
    { title: "报修登记 / 工单生成", time: ticket.created_at, tone: "done" },
    { title: "派工到班组", time: ticket.assigned_at, tone: idx >= 1 ? "done" : "idle", desc: ticket.crew_name ?? "" },
    { title: "班组到场", time: idx >= 2 ? ticket.assigned_at : null, tone: idx >= 2 ? "done" : "idle" },
    { title: "抢修中", time: idx >= 3 ? "—" : null, tone: idx >= 3 ? "active" : "idle" },
    { title: "复电确认（释放班组）", time: ticket.restored_at, tone: idx >= 4 ? "done" : "idle" }
  ];
}
</script>

<template>
  <section class="tickets-page">
    <div class="ticket-main">
      <div class="panel">
        <h2>待派工（{{ pending.length }}）— 按故障类型匹配技能，占用班组不可接单</h2>
        <EmptyState v-if="!pending.length" />
        <div v-for="ticket in pending" :key="ticket.id" class="ticket-block">
          <div class="ticket-row" @click="toggle(ticket.id)">
            <div class="ticket-id">#{{ ticket.id }}</div>
            <div class="ticket-info">
              <strong>资产 {{ ticket.asset_code }}</strong>
              <span class="muted">故障单 #{{ ticket.fault_report_id }}</span>
            </div>
            <PriorityTag :value="ticket.priority" />
            <StatusBadge :value="ticket.status" />
            <button class="btn btn-link"> {{ expanded.has(ticket.id) ? "收起" : "派工分析 ▾" }}</button>
          </div>
          <DispatchPanel v-if="expanded.has(ticket.id)" :ticket="ticket" @done="toggle(ticket.id)" />
        </div>
      </div>

      <div class="panel">
        <h2>在途工单（{{ inProgress.length }}）</h2>
        <EmptyState v-if="!inProgress.length" />
        <div v-for="ticket in inProgress" :key="ticket.id" class="ticket-block">
          <div class="ticket-row">
            <div class="ticket-id">#{{ ticket.id }}</div>
            <div class="ticket-info">
              <strong>{{ ticket.crew_name ?? "未派班组" }}</strong>
              <span class="muted">{{ ticket.asset_code }} · 派工于 {{ formatDate(ticket.assigned_at) }}</span>
            </div>
            <PriorityTag :value="ticket.priority" />
            <StatusBadge :value="ticket.status" />
            <div class="row-actions">
              <button
                v-if="flowOf(ticket.id).canAdvance()"
                class="btn btn-ghost"
                :disabled="acting"
                @click="advance(ticket.id)"
              >{{ flowOf(ticket.id).advanceLabel() }}</button>
              <button
                v-if="flowOf(ticket.id).canRestore()"
                class="btn btn-primary"
                :disabled="acting"
                @click="restore(ticket.id)"
              >复电确认</button>
            </div>
          </div>
          <p v-if="actionError[ticket.id]" class="dispatch-error">⛔ {{ actionError[ticket.id] }}</p>
          <TimelineList :items="timeline(ticket.id)" />
        </div>
      </div>

      <div class="panel">
        <h2>已复电 / 闭环（{{ finished.length }}）</h2>
        <table class="data-table compact">
          <thead><tr><th>工单</th><th>资产</th><th>班组</th><th>状态</th><th>派工时间</th><th>复电时间</th></tr></thead>
          <tbody>
            <tr v-for="ticket in finished" :key="ticket.id">
              <td>#{{ ticket.id }}</td><td>{{ ticket.asset_code }}</td><td>{{ ticket.crew_name ?? "—" }}</td>
              <td><StatusBadge :value="ticket.status" /></td>
              <td>{{ formatDate(ticket.assigned_at) }}</td><td>{{ formatDate(ticket.restored_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <aside class="occupancy-side panel">
      <h2>班组当前占用</h2>
      <p class="tip">有未结工单（已派工/已到场/抢修中）的班组不可再接新单，复电后自动释放。</p>
      <CrewCard v-for="crew in occupancy" :key="crew.id" :crew="crew" />
    </aside>
  </section>
</template>
