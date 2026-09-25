<script setup lang="ts">
import type { TimelineItem } from "../../types/Timeline";
defineProps<{ items: TimelineItem[] }>();
</script>

<template>
  <ol class="timeline">
    <li v-for="item in items" :key="item.key" :class="{ done: !item.active, active: item.active }">
      <span class="dot" />
      <div>
        <strong>{{ item.title }}</strong>
        <small v-if="item.time">{{ item.time }}</small>
        <p v-if="item.desc">{{ item.desc }}</p>
      </div>
    </li>
  </ol>
</template>
