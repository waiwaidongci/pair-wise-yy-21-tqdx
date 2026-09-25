<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { useFaultReportStore } from "../stores/FaultReportStore";
import StatusBadge from "../components/common/StatusBadge.vue";
import AssetTree from "../components/common/AssetTree.vue";
import EmptyState from "../components/common/EmptyState.vue";

const assetStore = useGridAssetStore();
const faultStore = useFaultReportStore();
const { rows, feederLines } = storeToRefs(assetStore);
const { rows: faults } = storeToRefs(faultStore);
const lineFilter = ref("");
const selectedId = ref<number | null>(null);

onMounted(async () => {
  await Promise.all([assetStore.load(), faultStore.load()]);
});

const filtered = computed(() =>
  rows.value.filter((asset) => !lineFilter.value || asset.feeder_line === lineFilter.value)
);

const faultsOfAsset = (assetId: number) =>
  faults.value.filter((fault) => fault.asset_id === assetId);
</script>

<template>
  <section class="assets-page">
    <div class="panel asset-tree-panel">
      <h2>线路 / 资产树</h2>
      <AssetTree :assets="rows" :selected-id="selectedId" @select="(a) => (selectedId = a.id)" />
    </div>
    <div class="panel asset-list-panel">
      <div class="toolbar">
        <h2>资产台账</h2>
        <select v-model="lineFilter">
          <option value="">全部线路</option>
          <option v-for="line in feederLines" :key="line" :value="line">{{ line }}</option>
        </select>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>资产编码</th><th>类型</th><th>所属线路</th><th>位置</th><th>电压</th><th>健康状态</th></tr>
        </thead>
        <tbody>
          <tr v-for="asset in filtered" :key="asset.id" :class="{ active: selectedId === asset.id }" @click="selectedId = asset.id">
            <td>{{ asset.asset_code }}</td><td>{{ asset.asset_type }}</td><td>{{ asset.feeder_line }}</td>
            <td>{{ asset.location_desc }}</td><td>{{ asset.voltage_level }}</td>
            <td><StatusBadge :value="asset.health_status" kind="health" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="panel asset-history-panel">
      <h2>历史故障</h2>
      <EmptyState v-if="selectedId == null">点击左侧资产查看其故障记录</EmptyState>
      <EmptyState v-else-if="!faultsOfAsset(selectedId).length">该资产暂无故障记录</EmptyState>
      <ul v-else class="fault-history">
        <li v-for="fault in faultsOfAsset(selectedId)" :key="fault.id">
          <span>#{{ fault.id }} {{ fault.address_desc }}</span>
          <StatusBadge :value="fault.status" />
        </li>
      </ul>
    </div>
  </section>
</template>
