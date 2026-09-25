import { get, post } from "./client";
import { mockData } from "../mocks/seedData";
import type { FaultReport, FaultReportForm } from "../types/FaultReport";

const endpoint = "/api/fault-report";

export async function listFaultReport(): Promise<FaultReport[]> {
  try {
    return await get<FaultReport[]>(endpoint);
  } catch {
    return mockData.faultReport.map((row) => ({ ...row }));
  }
}

export async function registerFaultReport(payload: FaultReportForm): Promise<FaultReport> {
  return post<FaultReport>(endpoint, payload);
}
