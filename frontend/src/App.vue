<script setup lang="ts">
import { computed, ref } from "vue";
import { routes } from "./router/routes";
import StatusBadge from "./components/common/StatusBadge.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import AssetsPage from "./pages/AssetsPage.vue";
import FaultsPage from "./pages/FaultsPage.vue";
import TicketsPage from "./pages/TicketsPage.vue";
import PartsPage from "./pages/PartsPage.vue";

const active = ref<string>(location.hash.replace("#", "") || "/dashboard");
window.addEventListener("hashchange", () => (active.value = location.hash.replace("#", "") || "/dashboard"));

const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);

const pageComponent = computed(() => {
  switch (active.value) {
    case "/assets": return AssetsPage;
    case "/faults": return FaultsPage;
    case "/tickets": return TicketsPage;
    case "/parts": return PartsPage;
    default: return DashboardPage;
  }
});
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <a
          v-for="route in routes"
          :key="route.route"
          :href="`#${route.route}`"
          :class="{ active: active === route.route }"
        >{{ route.name }}</a>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head">
        <div><p class="eyebrow">grid-repair</p><h1>{{ current?.name }}</h1></div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <component :is="pageComponent" />
    </main>
  </div>
</template>
