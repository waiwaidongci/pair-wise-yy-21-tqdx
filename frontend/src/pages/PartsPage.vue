<template>
  <section class="parts-page panel wide">
    <h2>备件领用记录</h2>
    <p class="hint">备件随抢修工单出库，仅展示本地种子与流程中产生的领用记录。</p>
    <EmptyState v-if="parts.rows.length === 0" text="暂无备件领用记录" />
    <table v-else>
      <thead>
        <tr><th>备件编码</th><th>名称</th><th>数量</th><th>所属工单</th><th>仓库</th><th>审批人</th><th>状态</th></tr>
      </thead>
      <tbody>
        <tr v-for="part in parts.rows" :key="part.id">
          <td>{{ part.part_code }}</td>
          <td>{{ part.part_name }}</td>
          <td>{{ part.quantity }}</td>
          <td>{{ part.ticket_no ?? part.ticket_id }}</td>
          <td>{{ part.warehouse_name }}</td>
          <td>{{ part.approved_by }}</td>
          <td><span class="badge info">{{ part.usage_status }}</span></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { useWorkspaceData } from "../hooks/useWorkspaceData";
import EmptyState from "../components/common/EmptyState.vue";

const { parts } = useWorkspaceData();
</script>
