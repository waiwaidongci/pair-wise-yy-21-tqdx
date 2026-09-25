<script setup lang="ts">
export interface TimelineItem {
  time?: string | null;
  title: string;
  desc?: string;
  tone?: "done" | "active" | "idle";
}

defineProps<{ items: TimelineItem[] }>();
</script>

<template>
  <ol class="timeline">
    <li v-for="(item, index) in items" :key="index" class="timeline-item" :class="item.tone ?? 'idle'">
      <span class="dot" />
      <div>
        <p class="t-title">{{ item.title }}</p>
        <p v-if="item.time" class="t-time">{{ item.time }}</p>
        <p v-if="item.desc" class="t-desc">{{ item.desc }}</p>
      </div>
    </li>
  </ol>
</template>
