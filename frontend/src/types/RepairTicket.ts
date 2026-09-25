export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number | null;
  dispatcher_id: number | null;
  priority: string;
  status: string;
  assigned_at: string | null;
  restored_at: string | null;
  created_at: string;
  // 后端 DTO 聚合字段
  fault_type?: string;
  asset_id?: number;
  asset_code?: string;
  severity?: string;
  crew_name?: string | null;
}
