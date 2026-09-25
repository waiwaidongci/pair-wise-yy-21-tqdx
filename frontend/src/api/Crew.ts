import { request } from "./client";
import type { Crew } from "../types/Crew";

export function listCrew(): Promise<Crew[]> {
  return request<Crew[]>("/crew");
}
