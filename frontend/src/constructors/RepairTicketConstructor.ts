import type { RepairTicket } from "../types/RepairTicket";

// 待派工工单的默认结构（登记故障后由后端生成，前端列表占位也走这里）
export const createDefaultRepairTicket = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 0,
  fault_report_id: 0,
  team_id: null,
  dispatcher_id: null,
  priority: "MEDIUM",
  status: "WAIT_DISPATCH",
  assigned_at: null,
  restored_at: null,
  created_at: "",
  ...overrides
});

export const createRepairTicketForm = createDefaultRepairTicket;
export const createRepairTicketResponse = createDefaultRepairTicket;
