export interface FaultReport {
  id: number;
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
  status: string;
  created_at: string;
  // 后端 DTO 聚合字段
  asset_code?: string;
  feeder_line?: string;
  ticket_id?: number | null;
  ticket_status?: string | null;
}

export interface FaultReportForm {
  reporter_name: string;
  phone: string;
  asset_id: number | null;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
}
