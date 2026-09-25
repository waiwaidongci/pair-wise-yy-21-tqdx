<script setup lang="ts">
import { computed } from "vue";
import type { GridAsset } from "../../types/GridAsset";
import StatusBadge from "./StatusBadge.vue";

const props = defineProps<{ assets: GridAsset[]; selectedId?: number | null }>();
const emit = defineEmits<{ (e: "select", asset: GridAsset): void }>();

const groups = computed(() => {
  const map = new Map<string, GridAsset[]>();
  for (const asset of props.assets) {
    const list = map.get(asset.feeder_line) ?? [];
    list.push(asset);
    map.set(asset.feeder_line, list);
  }
  return [...map.entries()];
});
</script>

<template>
  <div class="asset-tree">
    <div v-for="[line, list] in groups" :key="line" class="tree-line">
      <p class="tree-line-name">📍 {{ line }}<span class="tree-count">{{ list.length }}</span></p>
      <button
        v-for="asset in list"
        :key="asset.id"
        class="tree-asset"
        :class="{ active: selectedId === asset.id }"
        @click="emit('select', asset)"
      >
        <span>{{ asset.asset_code }} · {{ asset.asset_type }}</span>
        <StatusBadge :value="asset.health_status" kind="health" />
      </button>
    </div>
  </div>
</template>
