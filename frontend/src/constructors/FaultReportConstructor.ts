import type { CreateFaultPayload } from "../types/FaultReport";

/** 故障登记表单默认值，页面不在组件里散写默认结构。 */
export function createFaultReportForm(
  overrides: Partial<CreateFaultPayload> = {}
): CreateFaultPayload {
  return {
    reporter_name: "",
    phone: "",
    asset_id: 0,
    fault_type: "OUTAGE",
    address_desc: "",
    severity: "MEDIUM",
    report_channel: "95598 热线",
    ...overrides
  };
}
