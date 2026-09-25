export interface Crew {
  id: number;
  name: string;
  leader_id: number;
  skill_tags: string[];
  duty_status: "ON_DUTY" | "OFF_DUTY";
  current_ticket_id: number | null;
  occupied_ticket_no: string | null;
  available: boolean;
  contact_phone: string;
}

export interface BlockReason {
  code: string;
  message: string;
}

export interface CrewDispatchProfile {
  id: number;
  name: string;
  skill_tags: string[];
  duty_status: string;
  current_ticket_id: number | null;
  current_ticket_no: string | null;
  eligible: boolean;
  reasons: BlockReason[];
}

export interface CrewAvailability {
  fault_report_id: number;
  fault_no: string;
  fault_type: string;
  required_skills: string[];
  available_count: number;
  crews: CrewDispatchProfile[];
}
