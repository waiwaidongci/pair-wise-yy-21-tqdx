import { crewRepository } from "../repositories/store";
import { faultReportRepository } from "../repositories/store";
import { repairTicketRepository } from "../repositories/store";
import { gridAssetRepository } from "../repositories/store";

const MINUTES = 60 * 1000;

/**
 * 抢修态势统计：只读聚合，规则口径与工单服务保持一致
 * （未结 = ASSIGNED/ARRIVED/REPAIRING；占用 = current_ticket_id 非空）。
 */
export const dashboardService = {
  overview: () => {
    const tickets = repairTicketRepository.findAll();
    const crews = crewRepository.findAll();
    const assets = gridAssetRepository.findAll();
    const faults = faultReportRepository.findAll();

    const openStatus = ["ASSIGNED", "ARRIVED", "REPAIRING"];
    const restored = tickets
      .filter((ticket) => ticket.assigned_at && ticket.restored_at)
      .map((ticket) => Date.parse(ticket.restored_at!) - Date.parse(ticket.assigned_at!))
      .filter((ms) => Number.isFinite(ms) && ms >= 0);

    const avgRestoreMinutes = restored.length
      ? Math.round(restored.reduce((sum, ms) => sum + ms, 0) / restored.length / MINUTES)
      : 0;

    return {
      pending_dispatch: tickets.filter((ticket) => ticket.status === "WAIT_DISPATCH").length,
      in_progress: tickets.filter((ticket) => openStatus.includes(ticket.status)).length,
      restored_today: tickets.filter((ticket) => ["RESTORED", "CLOSED"].includes(ticket.status)).length,
      crew_total: crews.length,
      crew_occupied: crews.filter((crew) => crew.current_ticket_id !== null).length,
      crew_on_duty: crews.filter((crew) => crew.duty_status === "ON_DUTY").length,
      asset_abnormal: assets.filter((asset) => asset.health_status !== "NORMAL").length,
      open_faults: faults.filter((fault) => !["RESTORED", "CLOSED"].includes(fault.status)).length,
      avg_restore_minutes: avgRestoreMinutes
    };
  }
};
