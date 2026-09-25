import { get } from "./client";
import { mockData } from "../mocks/seedData";
import type { Crew } from "../types/Crew";

const endpoint = "/api/crew";

export async function listCrew(): Promise<Crew[]> {
  try {
    return await get<Crew[]>(endpoint);
  } catch {
    return mockData.crew.map((row) => ({ ...row }));
  }
}

export async function listCrewOccupancy(): Promise<Crew[]> {
  try {
    return await get<Crew[]>(`${endpoint}/occupancy`);
  } catch {
    return [...mockData.crew].sort(
      (a, b) => Number(Boolean(b.current_ticket_id)) - Number(Boolean(a.current_ticket_id))
    );
  }
}
