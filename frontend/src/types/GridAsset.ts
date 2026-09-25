export interface GridAsset {
  id: number;
  asset_code: string;
  asset_type: string;
  feeder_line: string;
  voltage_level: string;
  location_desc: string;
  health_status: string;
  owner_team_id: number | null;
  fault_count: number;
  open_fault_count: number;
  latest_fault: { id: number; fault_no: string; fault_type: string; status: string } | null;
}
