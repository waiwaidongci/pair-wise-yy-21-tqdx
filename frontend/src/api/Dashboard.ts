import { get } from "./client";
import { mockDashboard } from "../mocks/seedData";
import type { DashboardOverview } from "../types/Dispatch";

const endpoint = "/api/dashboard";

export async function getDashboardOverview(): Promise<DashboardOverview> {
  try {
    return await get<DashboardOverview>(endpoint);
  } catch {
    return { ...mockDashboard };
  }
}
