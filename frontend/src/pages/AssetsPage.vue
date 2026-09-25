<template>
  <section class="assets-page workbench">
    <div class="panel">
      <h2>线路资产树</h2>
      <div class="filter-bar">
        <select v-model="lineFilter">
          <option value="">全部线路</option>
          <option v-for="line in lines" :key="line" :value="line">{{ line }}</option>
        </select>
      </div>
      <AssetTree :assets="filteredAssets" :selected-id="selectedId" @select="selectedId = $event" />
    </div>

    <div class="panel wide">
      <h2>资产台账与健康状态</h2>
      <table>
        <thead>
          <tr><th>资产编码</th><th>类型</th><th>馈线</th><th>位置</th><th>健康状态</th><th>故障数</th><th>最近故障</th></tr>
        </thead>
        <tbody>
          <tr v-for="asset in filteredAssets" :key="asset.id"
              :class="{ selected: asset.id === selectedId }"
              @click="selectedId = asset.id">
            <td>{{ asset.asset_code }}</td>
            <td>{{ asset.asset_type }}</td>
            <td>{{ asset.feeder_line }}</td>
            <td>{{ asset.location_desc }}</td>
            <td><StatusBadge :value="asset.health_status" kind="health" /></td>
            <td>{{ asset.open_fault_count }} / {{ asset.fault_count }}</td>
            <td>
              <template v-if="asset.latest_fault">
                {{ asset.latest_fault.fault_no }}
                <StatusBadge :value="asset.latest_fault.status" kind="fault" />
              </template>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useWorkspaceData } from "../hooks/useWorkspaceData";
import AssetTree from "../components/common/AssetTree.vue";
import StatusBadge from "../components/common/StatusBadge.vue";

const { assets } = useWorkspaceData();
const lineFilter = ref("");
const selectedId = ref<number | null>(null);

const lines = computed(() => [...new Set(assets.rows.map((asset) => asset.feeder_line))]);
const filteredAssets = computed(() =>
  lineFilter.value ? assets.rows.filter((asset) => asset.feeder_line === lineFilter.value) : assets.rows
);
</script>
