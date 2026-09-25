<script setup lang="ts">
import { onMounted, ref, shallowRef, type Component } from "vue";
import { routes } from "./router/routes";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import StatusBadge from "./components/common/StatusBadge.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import AssetsPage from "./pages/AssetsPage.vue";
import FaultsPage from "./pages/FaultsPage.vue";
import TicketsPage from "./pages/TicketsPage.vue";
import PartsPage from "./pages/PartsPage.vue";

const pageMap: Record<string, Component> = {
  "/dashboard": DashboardPage,
  "/assets": AssetsPage,
  "/faults": FaultsPage,
  "/tickets": TicketsPage,
  "/parts": PartsPage
};

const active = ref<string>(location.hash.replace("#", "") || "/dashboard");
const current = shallowRef<Component>(pageMap[active.value] ?? DashboardPage);

const { crews, loadAll } = useWorkspaceData();
const ready = ref(false);
onMounted(async () => {
  await loadAll();
  ready.value = true;
});

function navigate(route: string) {
  active.value = route;
  current.value = pageMap[route] ?? DashboardPage;
  location.hash = route;
}
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网<br />抢修工单调度台</div>
      <nav>
        <button
          v-for="route in routes"
          :key="route.route"
          :class="{ active: active === route.route }"
          @click="navigate(route.route)"
        >
          {{ route.name }}
        </button>
      </nav>
      <div class="aside-foot">
        <p>待命班组</p>
        <strong>{{ crews.freeCount }} / {{ crews.rows.length }}</strong>
      </div>
    </aside>
    <main class="page">
      <section class="page-head">
        <div>
          <p class="eyebrow">grid-repair · 报修 → 派工 → 复电</p>
          <h1>{{ routes.find((r) => r.route === active)?.name }}</h1>
        </div>
        <StatusBadge value="ON_DUTY" kind="duty" />
      </section>
      <component :is="current" :data-ready="ready" />
    </main>
  </div>
</template>
