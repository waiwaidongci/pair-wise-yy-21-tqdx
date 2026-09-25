import { useGridAssetStore } from "../stores/GridAssetStore";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useCrewStore } from "../stores/CrewStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";

/**
 * 派工 / 复电会同时改动故障单、工单、班组占用、资产健康，
 * 动作完成后统一刷新四类数据，保证任意页面看到的都是最新联动状态。
 */
export function useWorkspaceData() {
  const assets = useGridAssetStore();
  const faults = useFaultReportStore();
  const tickets = useRepairTicketStore();
  const crews = useCrewStore();
  const parts = useSparePartUsageStore();

  async function loadAll() {
    await Promise.all([
      assets.load(),
      faults.load(),
      tickets.load(),
      crews.load(),
      parts.load()
    ]);
  }

  /** 写操作后联动刷新：故障单 + 工单 + 班组占用（+资产健康）。 */
  async function refreshAfterWrite() {
    await Promise.all([faults.load(), tickets.load(), crews.load(), assets.load()]);
  }

  return { assets, faults, tickets, crews, parts, loadAll, refreshAfterWrite };
}
