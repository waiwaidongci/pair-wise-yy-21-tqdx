import type { Crew } from "../models/Crew";

export interface CrewDto extends Crew {
  occupied: boolean;
}

export const createCrewDto = (row: Crew): CrewDto => ({
  ...row,
  occupied: row.current_ticket_id !== null
});

export const createCrewListDto = (rows: Crew[]): CrewDto[] => rows.map(createCrewDto);
