import type { RepairTicket } from "../types/RepairTicket";
import { TicketStatus } from "../constants/TicketStatus";

// 工单状态机（与后端 RepairTicketService.advance 同口径，前端只做按钮可用性）
const FLOW: Record<string, string | undefined> = {
  WAIT_DISPATCH: "ASSIGNED", // 经派工动作进入
  ASSIGNED: "ARRIVED",
  ARRIVED: "REPAIRING",
  REPAIRING: "RESTORED", // 经复电确认进入，同时释放班组、恢复资产健康
  RESTORED: "CLOSED",
  CLOSED: undefined
};

export function useTicketFlow(ticket: () => RepairTicket | undefined) {
  const canDispatch = () => ticket()?.status === TicketStatus[0];
  const canAdvance = () =>
    ticket() ? ["ASSIGNED", "ARRIVED"].includes(ticket()!.status) : false;
  const canRestore = () => ticket()?.status === "REPAIRING";
  const nextStatus = (status: string) => FLOW[status];
  const isOpen = (status: string) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(status);

  const advanceLabel = () => {
    const status = ticket()?.status;
    if (status === "ASSIGNED") return "确认到场";
    if (status === "ARRIVED") return "开始抢修";
    return "状态推进";
  };

  return { canDispatch, canAdvance, canRestore, nextStatus, isOpen, advanceLabel };
}
