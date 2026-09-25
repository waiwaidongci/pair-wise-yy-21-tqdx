<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useDashboardStore } from "../stores/DashboardStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useCrewStore } from "../stores/CrewStore";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import CrewCard from "../components/common/CrewCard.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { formatDate, formatFaultType, formatDurationMinutes } from "../utils/formatters";

const dashboardStore = useDashboardStore();
const ticketStore = useRepairTicketStore();
const crewStore = useCrewStore();
const { overview } = storeToRefs(dashboardStore);
const { occupancy } = storeToRefs(crewStore);

onMounted(async () => {
  await Promise.all([dashboardStore.load(), ticketStore.load(), crewStore.load()]);
});

const pendingTickets = computed(() => ticketStore.pending);
const openTickets = computed(() => ticketStore.open);
</script>

<template>
  <section class="dashboard">
    <div class="metrics">
      <StatCard label="待派工工单" :value="overview?.pending_dispatch ?? '—'" />
      <StatCard label="在途抢修" :value="overview?.in_progress ?? '—'" />
      <StatCard label="未结故障" :value="overview?.open_faults ?? '—'" />
      <StatCard label="班组占用 / 待命" :value="`${overview?.crew_occupied ?? 0} / ${overview?.crew_on_duty ?? 0}`" />
      <StatCard label="异常资产" :value="overview?.asset_abnormal ?? '—'" />
      <StatCard label="平均复电时长" :value="formatDurationMinutes(overview?.avg_restore_minutes ?? 0)" />
    </div>

    <div class="dash-grid">
      <div class="panel">
        <h2>待派工队列</h2>
        <EmptyState v-if="!pendingTickets.length">暂无待派工工单</EmptyState>
        <div v-for="ticket in pendingTickets" :key="ticket.id" class="dash-row">
          <strong>#{{ ticket.id }} · {{ ticket.asset_code }}</strong>
          <span>{{ formatFaultType(ticket.fault_type ?? "") }}</span>
          <PriorityTag :value="ticket.priority" />
          <StatusBadge :value="ticket.status" />
        </div>
      </div>

      <div class="panel">
        <h2>班组实时占用</h2>
        <EmptyState v-if="!occupancy.length" />
        <CrewCard v-for="crew in occupancy" :key="crew.id" :crew="crew" />
      </div>
    </div>

    <div class="panel">
      <h2>在途抢修进度</h2>
      <EmptyState v-if="!openTickets.length" />
      <table v-else class="data-table compact">
        <thead><tr><th>工单</th><th>资产</th><th>班组</th><th>等级</th><th>状态</th><th>派工时间</th></tr></thead>
        <tbody>
          <tr v-for="ticket in openTickets" :key="ticket.id">
            <td>#{{ ticket.id }}</td><td>{{ ticket.asset_code }}</td><td>{{ ticket.crew_name ?? "—" }}</td>
            <td><PriorityTag :value="ticket.priority" /></td>
            <td><StatusBadge :value="ticket.status" /></td>
            <td>{{ formatDate(ticket.assigned_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
