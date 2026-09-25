import { request } from "./client";
import type { FaultReport, CreateFaultPayload } from "../types/FaultReport";

export function listFaultReport(): Promise<FaultReport[]> {
  return request<FaultReport[]>("/fault-report");
}

export function createFaultReport(payload: CreateFaultPayload): Promise<FaultReport> {
  return request<FaultReport>("/fault-report", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
