<template>
  <section class="faults-page">
    <div class="panel">
      <h2>故障报修登记</h2>
      <p class="hint">登记时关联台账资产，系统按故障类型自动匹配具备相应技能的待命班组，并同步更新资产健康。</p>
      <form class="fault-form" @submit.prevent="submit">
        <label>报修人<input v-model="form.reporter_name" placeholder="姓名 / 单位" required /></label>
        <label>联系电话<input v-model="form.phone" placeholder="手机号" required /></label>
        <label>关联资产
          <select v-model.number="form.asset_id" required>
            <option :value="0" disabled>请选择台账资产</option>
            <option v-for="asset in assets.rows" :key="asset.id" :value="asset.id">
              {{ asset.asset_code }}（{{ asset.feeder_line }}）
            </option>
          </select>
        </label>
        <label>故障类型
          <select v-model="form.fault_type">
            <option v-for="value in FaultType" :key="value" :value="value">{{ FaultTypeText[value] }}</option>
          </select>
        </label>
        <label>严重程度
          <select v-model="form.severity">
            <option value="LOW">低</option>
            <option value="MEDIUM">中</option>
            <option value="HIGH">高</option>
            <option value="CRITICAL">紧急</option>
          </select>
        </label>
        <label>报修渠道
          <select v-model="form.report_channel">
            <option>95598 热线</option>
            <option>在线报修</option>
            <option>调度转单</option>
            <option>现场上报</option>
          </select>
        </label>
        <label class="wide">地址 / 现象<input v-model="form.address_desc" placeholder="故障位置与现象描述" /></label>
        <div class="form-actions wide">
          <button class="primary" type="submit" :disabled="submitting">
            {{ submitting ? "提交中…" : "登记故障" }}
          </button>
          <p v-if="form.asset_id" class="hint">
            登记后资产健康将置为「{{ healthAfterText }}」
          </p>
        </div>
      </form>
      <p v-if="registerError" class="error-box">{{ registerError }}</p>
    </div>

    <div class="panel">
      <h2>派工候选评估</h2>
      <p class="hint">选中一条待派工故障，查看每个班组能否接单及具体阻断原因。</p>
      <div class="fault-picker">
        <button
          v-for="fault in faults.pending"
          :key="fault.id"
          class="fault-chip"
          :class="{ active: selectedFaultId === fault.id }"
          @click="pickFault(fault.id)"
        >
          {{ fault.fault_no }} · {{ formatFaultType(fault.fault_type) }}
        </button>
        <span v-if="faults.pending.length === 0" class="hint">暂无待派工故障</span>
      </div>

      <div v-if="availability.availability.value" class="dispatch-panel">
        <p class="required-skills">
          故障 {{ availability.availability.value.fault_no }}
          需要技能：
          <b>{{ availability.availability.value.required_skills.map(skillLabel).join("、") }}</b>
          ，合格班组 {{ availability.availability.value.available_count }} 个
        </p>
        <div class="crew-grid">
          <CrewCard
            v-for="profile in availability.availability.value.crews"
            :key="profile.id"
            :crew="profile"
            selectable
            @select="doDispatch"
          />
        </div>
        <button class="primary auto-btn" @click="autoDispatch">自动选择合格班组派工</button>
      </div>
      <p v-for="(msg, i) in availability.errorMessages.value" :key="i" class="error-box">{{ msg }}</p>
    </div>

    <div class="panel wide">
      <h2>故障单列表</h2>
      <table class="data-table">
        <thead>
          <tr><th>故障编号</th><th>类型</th><th>关联资产 / 线路</th><th>资产健康</th><th>状态</th><th>未结工单</th><th>报修人</th></tr>
        </thead>
        <tbody>
          <tr v-for="fault in faults.rows" :key="fault.id">
            <td>{{ fault.fault_no }}</td>
            <td>{{ formatFaultType(fault.fault_type) }}</td>
            <td>{{ fault.asset?.asset_code ?? "—" }}<br /><small>{{ fault.asset?.feeder_line }}</small></td>
            <td><StatusBadge v-if="fault.asset" :value="fault.asset.health_status" kind="health" /></td>
            <td><StatusBadge :value="fault.status" kind="fault" /></td>
            <td>{{ fault.open_ticket_no ?? "—" }}</td>
            <td>{{ fault.reporter_name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { FaultType, FaultTypeText } from "../constants/FaultType";
import { FAULT_HEALTH_TEXT } from "../constants/healthText";
import { skillLabel } from "../constants/skillLabels";
import { formatFaultType } from "../utils/formatters";
import { createFaultReportForm } from "../constructors/FaultReportConstructor";
import { useWorkspaceData } from "../hooks/useWorkspaceData";
import { useCrewAvailability } from "../hooks/useCrewAvailability";
import { extractReasons } from "../api/client";
import StatusBadge from "../components/common/StatusBadge.vue";
import CrewCard from "../components/common/CrewCard.vue";

const { assets, faults, refreshAfterWrite } = useWorkspaceData();
const availability = useCrewAvailability();

const form = reactive(createFaultReportForm());
const submitting = ref(false);
const registerError = ref("");
const selectedFaultId = ref<number | null>(null);

const healthAfterText = computed(
  () => FAULT_HEALTH_TEXT[form.fault_type as keyof typeof FAULT_HEALTH_TEXT] ?? "—"
);

async function submit() {
  submitting.value = true;
  registerError.value = "";
  try {
    await faults.register({ ...form });
    Object.assign(form, createFaultReportForm());
    await refreshAfterWrite();
  } catch (error) {
    registerError.value = extractReasons(error)[0];
  } finally {
    submitting.value = false;
  }
}

async function pickFault(id: number) {
  selectedFaultId.value = id;
  await availability.evaluate(id);
}

async function afterDispatch() {
  await refreshAfterWrite();
  if (selectedFaultId.value) await availability.evaluate(selectedFaultId.value);
}

async function doDispatch(teamId: number) {
  if (selectedFaultId.value == null) return;
  try {
    const { tickets } = useWorkspaceData();
    await tickets.dispatch(selectedFaultId.value, teamId);
    await afterDispatch();
  } catch (error) {
    availability.errorMessages.value = extractReasons(error);
  }
}

async function autoDispatch() {
  if (selectedFaultId.value == null) return;
  try {
    const { tickets } = useWorkspaceData();
    await tickets.dispatch(selectedFaultId.value);
    await afterDispatch();
  } catch (error) {
    availability.errorMessages.value = extractReasons(error);
  }
}
</script>
