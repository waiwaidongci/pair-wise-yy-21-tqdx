import type { FaultReport } from "../models/FaultReport";
import type { GridAsset } from "../models/GridAsset";

export interface FaultReportDto extends FaultReport {
  asset_code?: string;
  feeder_line?: string;
  ticket_id?: number | null;
  ticket_status?: string | null;
}

export const createFaultReportDto = (
  row: FaultReport,
  refs: { asset?: GridAsset; ticketId?: number | null; ticketStatus?: string | null } = {}
): FaultReportDto => ({
  ...row,
  asset_code: refs.asset?.asset_code,
  feeder_line: refs.asset?.feeder_line,
  ticket_id: refs.ticketId ?? null,
  ticket_status: refs.ticketStatus ?? null
});
