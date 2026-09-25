<script setup lang="ts">
import { computed } from "vue";
import type { GridAsset } from "../../types/GridAsset";
import StatusBadge from "./StatusBadge.vue";

const props = defineProps<{ assets: GridAsset[]; selectedId?: number | null }>();
const emit = defineEmits<{ (e: "select", id: number): void }>();

/** 按馈线分组的资产树。 */
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
    <section v-for="[line, list] in groups" :key="line" class="tree-group">
      <h4>{{ line }}<span class="count">{{ list.length }}</span></h4>
      <button
        v-for="asset in list"
        :key="asset.id"
        class="tree-node"
        :class="{ selected: asset.id === selectedId }"
        @click="emit('select', asset.id)"
      >
        <span>{{ asset.asset_code }} · {{ asset.location_desc }}</span>
        <StatusBadge :value="asset.health_status" kind="health" />
      </button>
    </section>
  </div>
</template>
