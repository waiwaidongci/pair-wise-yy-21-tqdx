export interface Crew {
  id: number;
  name: string;
  leader_id: number;
  skill_tags: string[];
  duty_status: string; // CrewDutyStatus: ON_DUTY / OFF_DUTY
  current_ticket_id: number | null;
  contact_phone: string;
}
