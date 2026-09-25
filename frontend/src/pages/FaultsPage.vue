<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { createFaultReportForm } from "../constructors/FaultReportConstructor";
import { FaultType, FaultTypeText } from "../constants/FaultType";
import { Severity, SeverityText } from "../constants/Severity";
import type { ApiError } from "../api/client";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import AssetTree from "../components/common/AssetTree.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { formatDate, formatFaultType } from "../utils/formatters";
import type { GridAsset } from "../types/GridAsset";

const faultStore = useFaultReportStore();
const assetStore = useGridAssetStore();
const { rows, submitting } = storeToRefs(faultStore);
const { rows: assets, feederLines } = storeToRefs(assetStore);

const form = reactive(createFaultReportForm());
const formError = ref<string | null>(null);
const justCreated = ref<number | null>(null);
const lineFilter = ref("");
const showForm = ref(false);

onMounted(async () => {
  await Promise.all([assetStore.load(), faultStore.load()]);
});

const filtered = computed(() =>
  [...rows.value]
    .filter((row) => {
      if (!lineFilter.value) return true;
      return assetStore.byId(row.asset_id)?.feeder_line === lineFilter.value;
    })
    .sort((a, b) => b.id - a.id)
);

function pickAsset(asset: GridAsset) {
  form.asset_id = asset.id;
  if (!form.address_desc) form.address_desc = asset.location_desc;
}

async function submit() {
  formError.value = null;
  if (form.asset_id == null) {
    formError.value = "请先在左侧资产树选择关联资产，故障必须挂到在册设备上";
    return;
  }
  try {
    const created = await faultStore.register({ ...form });
    justCreated.value = created.id;
    Object.assign(form, createFaultReportForm());
    showForm.value = false;
    setTimeout(() => (justCreated.value = null), 4000);
  } catch (err) {
    formError.value = (err as ApiError).message;
  }
}
</script>

<template>
  <section class="faults-page">
    <div class="toolbar">
      <div class="filters">
        <label>线路：</label>
        <select v-model="lineFilter">
          <option value="">全部线路</option>
          <option v-for="line in feederLines" :key="line" :value="line">{{ line }}</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? "收起登记表" : "＋ 登记故障报修" }}
      </button>
    </div>

    <div v-if="showForm" class="register-grid">
      <div class="panel">
        <h2>① 选择关联资产（来自台账）</h2>
        <AssetTree :assets="assets" :selected-id="form.asset_id" @select="pickAsset" />
        <p v-if="form.asset_id != null" class="picked">
          已关联：{{ assetStore.byId(form.asset_id)?.asset_code }}
          （{{ assetStore.byId(form.asset_id)?.location_desc }}）
        </p>
      </div>
      <div class="panel">
        <h2>② 报修信息</h2>
        <div class="form-grid">
          <label>报修人<input v-model="form.reporter_name" placeholder="姓名" /></label>
          <label>联系电话<input v-model="form.phone" placeholder="手机号" /></label>
          <label>故障类型
            <select v-model="form.fault_type">
              <option v-for="t in FaultType" :key="t" :value="t">{{ FaultTypeText[t] }}</option>
            </select>
          </label>
          <label>严重等级
            <select v-model="form.severity">
              <option v-for="s in Severity" :key="s" :value="s">{{ SeverityText[s] }}</option>
            </select>
          </label>
          <label>报修渠道
            <select v-model="form.report_channel">
              <option>95598</option>
              <option>微信小程序</option>
              <option>巡线上报</option>
              <option>应急专线</option>
            </select>
          </label>
          <label class="span2">故障地址 / 描述
            <input v-model="form.address_desc" placeholder="不填则带出资产位置" />
          </label>
        </div>
        <p class="tip">登记后自动：生成待派工工单；按严重等级联动资产健康（中→降级、高/紧急→危急）。</p>
        <p v-if="formError" class="dispatch-error">⛔ {{ formError }}</p>
        <button class="btn btn-primary" :disabled="submitting" @click="submit">
          {{ submitting ? "提交中…" : "提交报修并生成工单" }}
        </button>
      </div>
    </div>

    <div class="panel">
      <h2>故障报修单（{{ filtered.length }}）</h2>
      <EmptyState v-if="!filtered.length">当前线路没有故障单</EmptyState>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>#</th><th>报修人</th><th>关联资产 / 线路</th><th>故障类型</th>
            <th>等级</th><th>渠道</th><th>故障单</th><th>关联工单</th><th>登记时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.id" :class="{ flash: justCreated === row.id }">
            <td>{{ row.id }}</td>
            <td>{{ row.reporter_name }}<br /><span class="muted">{{ row.phone }}</span></td>
            <td>{{ row.asset_code ?? `资产#${row.asset_id}` }}<br /><span class="muted">{{ row.feeder_line }}</span></td>
            <td>{{ formatFaultType(row.fault_type) }}</td>
            <td><PriorityTag :value="row.severity" /></td>
            <td>{{ row.report_channel }}</td>
            <td><StatusBadge :value="row.status" /></td>
            <td>
              <span v-if="row.ticket_id">#{{ row.ticket_id }} </span>
              <StatusBadge v-if="row.ticket_status" :value="row.ticket_status" />
            </td>
            <td>{{ formatDate(row.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
