import { computed, ref, type Ref } from "vue";

type Source<T> = T[] | Ref<T[]> | (() => T[]);

// 通用分页：态势/工单/故障列表共用，兼容直接传数组或响应式源
export function usePagination<T>(source: Source<T>, pageSize = 8) {
  const page = ref(1);
  const rows = computed<T[]>(() =>
    Array.isArray(source) ? source : typeof source === "function" ? (source as () => T[])() : source.value
  );
  const total = computed(() => rows.value.length);
  const pageRows = computed(() =>
    rows.value.slice((page.value - 1) * pageSize, page.value * pageSize)
  );
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
  const go = (target: number) => {
    page.value = Math.min(totalPages.value, Math.max(1, target));
  };
  return { page, pageSize, pageRows, total, totalPages, go };
}
