<template>
  <section class="tickets-page">
    <div class="panel wide">
      <h2>抢修工单与班组占用</h2>
      <p class="hint">派工后工单状态、班组占用同步生效；复电确认会释放班组并将资产健康恢复为正常。</p>
      <p v-if="actionError" class="error-box">{{ actionError }}</p>
      <div class="ticket-list">
        <article v-for="ticket in tickets.rows" :key="ticket.id" class="ticket-card">
          <header>
            <div>
              <strong class="ticket-no">{{ ticket.ticket_no }}</strong>
              <StatusBadge :value="ticket.status" />
            </div>
            <PriorityTag :value="ticket.priority" />
          </header>

          <div class="ticket-body">
            <dl>
              <div><dt>故障</dt><dd>{{ ticket.fault?.fault_no }} · {{ formatFaultType(ticket.fault?.fault_type ?? "") }}</dd></div>
              <div><dt>现象</dt><dd>{{ ticket.fault?.address_desc }}</dd></div>
              <div><dt>承接班组</dt>
                <dd>
                  {{ ticket.crew?.name ?? "—" }}
                  <small v-if="occupyingTicketNo(ticket.team_id) === ticket.ticket_no" class="danger-text">（占用中）</small>
                  <small v-else-if="ticket.crew" class="ok-text">（已释放）</small>
                </dd>
              </div>
              <div><dt>资产 / 线路</dt><dd>{{ ticket.asset?.asset_code }} · {{ ticket.asset?.feeder_line }}
                <StatusBadge v-if="ticket.asset" :value="ticket.asset.health_status" kind="health" />
              </dd></div>
            </dl>

            <TimelineList :items="timelineOf(ticket)" />
          </div>

          <footer>
            <button v-if="flow.canArrive(ticket)" class="small" @click="act(() => flow.arrive(ticket.id))">确认到场</button>
            <button v-if="flow.canRepair(ticket)" class="small" @click="act(() => flow.repairing(ticket.id))">开始抢修</button>
            <button v-if="flow.canRestore(ticket)" class="small primary" @click="act(() => flow.restore(ticket.id))">复电确认</button>
            <span v-if="['RESTORED','CLOSED'].includes(ticket.status)" class="ok-text">
              已复电，耗时 {{ durationMinutes(ticket.assigned_at, ticket.restored_at) ?? "—" }} 分钟
            </span>
          </footer>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useWorkspaceData } from "../hooks/useWorkspaceData";
import { useTicketFlow } from "../hooks/useTicketFlow";
import { extractReasons } from "../api/client";
import { formatDateTime, formatFaultType, durationMinutes } from "../utils/formatters";
import type { RepairTicket } from "../types/RepairTicket";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import TimelineList from "../components/common/TimelineList.vue";
import type { TimelineItem } from "../types/Timeline";

const { tickets, crews, refreshAfterWrite } = useWorkspaceData();
const flow = useTicketFlow();
const actionError = ref("");

function occupyingTicketNo(teamId: number): string | null {
  return crews.rows.find((crew) => crew.id === teamId)?.occupied_ticket_no ?? null;
}

function timelineOf(ticket: RepairTicket): TimelineItem[] {
  return [
    { key: "assigned", title: "派工", time: formatDateTime(ticket.assigned_at), active: ticket.status === "ASSIGNED" },
    { key: "arrived", title: "到场", time: formatDateTime(ticket.arrived_at), active: ticket.status === "ARRIVED" },
    { key: "repairing", title: "抢修中", time: ticket.status === "REPAIRING" ? "进行中" : null, active: ticket.status === "REPAIRING" },
    { key: "restored", title: "复电确认", time: formatDateTime(ticket.restored_at), active: false }
  ];
}

async function act(fn: () => Promise<void>) {
  actionError.value = "";
  try {
    await fn();
    await refreshAfterWrite();
  } catch (error) {
    actionError.value = extractReasons(error)[0];
  }
}
</script>
