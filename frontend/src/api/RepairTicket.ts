import { get, post } from "./client";
import { mockData, mockDispatchPlan } from "../mocks/seedData";
import type { RepairTicket } from "../types/RepairTicket";
import type { DispatchPlan } from "../types/Dispatch";

const endpoint = "/api/repair-ticket";

export async function listRepairTicket(): Promise<RepairTicket[]> {
  try {
    return await get<RepairTicket[]>(endpoint);
  } catch {
    return mockData.repairTicket.map((row) => ({ ...row }));
  }
}

export async function getDispatchPlan(ticketId: number): Promise<DispatchPlan> {
  try {
    return await get<DispatchPlan>(`${endpoint}/${ticketId}/dispatch-plan`);
  } catch {
    return { ...mockDispatchPlan, ticket_id: ticketId };
  }
}

export async function dispatchTicket(ticketId: number, teamId: number): Promise<RepairTicket> {
  return post<RepairTicket>(`${endpoint}/${ticketId}/dispatch`, { team_id: teamId, dispatcher_id: 9001 });
}

export async function advanceTicket(ticketId: number): Promise<RepairTicket> {
  return post<RepairTicket>(`${endpoint}/${ticketId}/advance`);
}

export async function restoreTicket(ticketId: number): Promise<RepairTicket> {
  return post<RepairTicket>(`${endpoint}/${ticketId}/restore`);
}
