export type DispatchBlockCode = "SKILL_NOT_MATCHED" | "CREW_OFF_DUTY" | "CREW_BUSY";

export interface DispatchOption {
  crew_id: number;
  crew_name: string;
  eligible: boolean;
  reasons: DispatchBlockCode[];
  required_skill: string;
  required_skill_label: string;
  actual_skills: string[];
  duty_status: string;
  current_ticket_id: number | null;
}

export interface DispatchPlan {
  ticket_id: number;
  fault_report_id: number;
  fault_type: string;
  required_skill: string;
  required_skill_label: string;
  options: DispatchOption[];
  has_eligible_crew: boolean;
  blocked_reason: string | null;
}

export interface DashboardOverview {
  pending_dispatch: number;
  in_progress: number;
  restored_today: number;
  crew_total: number;
  crew_occupied: number;
  crew_on_duty: number;
  asset_abnormal: number;
  open_faults: number;
  avg_restore_minutes: number;
}
