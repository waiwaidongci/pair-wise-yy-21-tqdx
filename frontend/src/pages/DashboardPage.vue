<template>
  <section class="dashboard">
    <div class="metrics">
      <StatCard label="待派工故障" :value="faults.pending.length" />
      <StatCard label="抢修中工单" :value="tickets.openTickets.length" />
      <StatCard label="待命空闲班组" :value="`${crews.freeCount} / ${crews.rows.length}`" />
      <StatCard label="异常资产" :value="assets.abnormalCount" />
    </div>

    <div class="workbench">
      <div class="panel">
        <h2>进行中的抢修</h2>
        <EmptyState v-if="tickets.openTickets.length === 0" text="当前没有进行中的工单" />
        <article v-for="ticket in tickets.openTickets" :key="ticket.id" class="dash-row">
          <div>
            <strong>{{ ticket.ticket_no }}</strong>
            <span class="sub">{{ ticket.fault?.fault_no }} · {{ formatFaultType(ticket.fault?.fault_type ?? "") }}（{{ ticket.asset?.feeder_line }}）</span>
          </div>
          <StatusBadge :value="ticket.status" />
          <PriorityTag :value="ticket.priority" />
          <span class="crew">{{ ticket.crew?.name }}</span>
        </article>
      </div>

      <div class="panel">
        <h2>班组占用态势</h2>
        <article v-for="crew in crews.rows" :key="crew.id" class="crew-status-row">
          <div>
            <strong>{{ crew.name }}</strong>
            <span class="sub">
              <span v-for="tag in crew.skill_tags" :key="tag" class="skill">{{ skillLabel(tag) }}</span>
            </span>
          </div>
          <StatusBadge :value="crew.duty_status" kind="duty" />
          <b v-if="crew.occupied_ticket_no" class="danger-text">占用 {{ crew.occupied_ticket_no }}</b>
          <b v-else class="ok-text">空闲可接单</b>
        </article>
        <p class="hint avg">平均复电耗时：{{ avgRestoreText }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWorkspaceData } from "../hooks/useWorkspaceData";
import { formatFaultType, durationMinutes } from "../utils/formatters";
import { skillLabel } from "../constants/skillLabels";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import EmptyState from "../components/common/EmptyState.vue";

const { assets, faults, tickets, crews } = useWorkspaceData();

const avgRestoreText = computed(() => {
  const done = tickets.rows
    .map((ticket) => durationMinutes(ticket.assigned_at, ticket.restored_at))
    .filter((value): value is number => value != null);
  if (done.length === 0) return "—";
  return `${Math.round(done.reduce((sum, value) => sum + value, 0) / done.length)} 分钟`;
});
</script>
