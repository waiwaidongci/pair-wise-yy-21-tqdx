<script setup lang="ts">
defineProps<{ text?: string }>();
</script>

<template>
  <div class="empty">
    <span>📭</span>
    <p>{{ text ?? "暂无数据" }}</p>
  </div>
</template>
