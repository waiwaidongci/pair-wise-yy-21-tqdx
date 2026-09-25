import type { FaultReport } from "../models/FaultReport";
import type { GridAsset } from "../models/GridAsset";
import type { RepairTicket } from "../models/RepairTicket";

/** 故障响应 DTO：内嵌关联资产摘要与未结工单，页面不用手工拼表。 */
export function createFaultReportDto(
  fault: FaultReport,
  asset?: GridAsset,
  openTicket?: RepairTicket
) {
  return {
    ...fault,
    asset: asset
      ? {
          id: asset.id,
          asset_code: asset.asset_code,
          feeder_line: asset.feeder_line,
          location_desc: asset.location_desc,
          health_status: asset.health_status
        }
      : null,
    open_ticket_id: openTicket?.id ?? null,
    open_ticket_no: openTicket?.ticket_no ?? null,
    ticket_status: openTicket?.status ?? null
  };
}

/** 故障登记表单默认值，controller/页面共用同一份默认结构。 */
export function createFaultReportForm(overrides: Partial<FaultReport> = {}) {
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
