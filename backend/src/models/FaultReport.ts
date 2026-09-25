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
  status: string; // FaultStatus: PENDING / PROCESSING / RESOLVED
  created_at: string;
}
