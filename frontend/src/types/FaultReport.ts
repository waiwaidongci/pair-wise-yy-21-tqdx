export interface FaultAssetRef {
  id: number;
  asset_code: string;
  feeder_line: string;
  location_desc?: string;
  health_status: string;
}

export interface FaultReport {
  id: number;
  fault_no: string;
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
  status: "PENDING" | "PROCESSING" | "RESOLVED";
  created_at: string;
  asset: FaultAssetRef | null;
  open_ticket_id: number | null;
  open_ticket_no: string | null;
  ticket_status: string | null;
}

export interface CreateFaultPayload {
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
}
