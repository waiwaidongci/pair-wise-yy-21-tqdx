import type { RepairTicket } from "../models/RepairTicket";
import type { FaultReport } from "../models/FaultReport";
import type { Crew } from "../models/Crew";
import type { SparePartUsage } from "../models/SparePartUsage";
import type { GridAsset } from "../models/GridAsset";

/** 工单响应 DTO：聚合故障、班组、备件与资产，供工单页/态势页直接渲染。 */
export function createRepairTicketDto(
  ticket: RepairTicket,
  fault?: FaultReport,
  crew?: Crew,
  parts: SparePartUsage[] = [],
  asset?: GridAsset
) {
  return {
    ...ticket,
    fault: fault
      ? {
          id: fault.id,
          fault_no: fault.fault_no,
          fault_type: fault.fault_type,
          severity: fault.severity,
          address_desc: fault.address_desc,
          reporter_name: fault.reporter_name
        }
      : null,
    crew: crew
      ? { id: crew.id, name: crew.name, contact_phone: crew.contact_phone }
      : null,
    asset: asset
      ? {
          id: asset.id,
          asset_code: asset.asset_code,
          feeder_line: asset.feeder_line,
          health_status: asset.health_status
        }
      : null,
    parts: parts.map((part) => ({
      id: part.id,
      part_name: part.part_name,
      quantity: part.quantity,
      usage_status: part.usage_status
    }))
  };
}
