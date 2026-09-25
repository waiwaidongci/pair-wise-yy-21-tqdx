import type { DutyStatus } from "../constants/DutyStatus";

export interface Crew {
  id: number;
  name: string;
  leader_id: number;
  skill_tags: string[];
  duty_status: DutyStatus;
  current_ticket_id: number | null;
  contact_phone: string;
}
