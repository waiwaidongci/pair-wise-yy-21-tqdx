import type { FaultReportForm } from "../types/FaultReport";

export const createFaultReportForm = (
  overrides: Partial<FaultReportForm> = {}
): FaultReportForm => ({
  reporter_name: "",
  phone: "",
  asset_id: null,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: "95598",
  ...overrides
});

export const createDefaultFaultReport = createFaultReportForm;
export const createFaultReportResponse = createFaultReportForm;
