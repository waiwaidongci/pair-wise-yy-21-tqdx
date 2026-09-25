export interface RepairTicket {
  id: number;
  ticket_no: string;
  fault_report_id: number;
  team_id: number;
  dispatcher_id: number;
  priority: string;
  status: string; // TicketStatus
  assigned_at: string | null;
  arrived_at: string | null;
  restored_at: string | null;
}
