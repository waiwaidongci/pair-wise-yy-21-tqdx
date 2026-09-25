import { request } from "./client";
import type { RepairTicket } from "../types/RepairTicket";
import type { CrewAvailability } from "../types/Crew";

export function listRepairTicket(): Promise<RepairTicket[]> {
  return request<RepairTicket[]>("/repair-ticket");
}

export function fetchCandidates(faultReportId: number): Promise<CrewAvailability> {
  return request<CrewAvailability>(
    `/repair-ticket/candidates?faultReportId=${faultReportId}`
  );
}

export function dispatchTicket(faultReportId: number, teamId?: number): Promise<RepairTicket> {
  return request<RepairTicket>("/repair-ticket/dispatch", {
    method: "POST",
    body: JSON.stringify(
      teamId == null ? { fault_report_id: faultReportId } : { fault_report_id: faultReportId, team_id: teamId }
    )
  });
}

export function arriveTicket(id: number): Promise<RepairTicket> {
  return request<RepairTicket>(`/repair-ticket/${id}/arrive`, { method: "POST" });
}

export function repairTicket(id: number): Promise<RepairTicket> {
  return request<RepairTicket>(`/repair-ticket/${id}/repair`, { method: "POST" });
}

export function restoreTicket(id: number): Promise<RepairTicket> {
  return request<RepairTicket>(`/repair-ticket/${id}/restore`, { method: "POST" });
}
