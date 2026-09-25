export interface TicketFaultRef {
  id: number;
  fault_no: string;
  fault_type: string;
  severity: string;
  address_desc: string;
  reporter_name: string;
}

export interface TicketCrewRef {
  id: number;
  name: string;
  contact_phone: string;
}

export interface TicketAssetRef {
  id: number;
  asset_code: string;
  feeder_line: string;
  health_status: string;
}

export interface RepairTicket {
  id: number;
  ticket_no: string;
  fault_report_id: number;
  team_id: number;
  dispatcher_id: number;
  priority: string;
  status: string;
  assigned_at: string | null;
  arrived_at: string | null;
  restored_at: string | null;
  fault: TicketFaultRef | null;
  crew: TicketCrewRef | null;
  asset: TicketAssetRef | null;
  parts: Array<{ id: number; part_name: string; quantity: number; usage_status: string }>;
}
