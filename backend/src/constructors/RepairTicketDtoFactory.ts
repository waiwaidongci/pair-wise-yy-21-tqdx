import type { RepairTicket } from "../models/RepairTicket";
import type { FaultReport } from "../models/FaultReport";
import type { Crew } from "../models/Crew";
import type { GridAsset } from "../models/GridAsset";
import type { CrewDispatchCheck } from "../rules/dispatchRules";

export interface RepairTicketDto extends RepairTicket {
  fault_type?: string;
  asset_id?: number;
  asset_code?: string;
  severity?: string;
  crew_name?: string | null;
}

export const createRepairTicketDto = (
  row: RepairTicket,
  refs: { fault?: FaultReport; asset?: GridAsset; crew?: Crew } = {}
): RepairTicketDto => ({
  ...row,
  fault_type: refs.fault?.fault_type,
  asset_id: refs.fault?.asset_id,
  asset_code: refs.asset?.asset_code,
  severity: refs.fault?.severity,
  crew_name: refs.crew?.name ?? null
});

export interface DispatchOptionDto extends CrewDispatchCheck {
  required_skill_label: string;
}

export interface DispatchPlanDto {
  ticket_id: number;
  fault_report_id: number;
  fault_type: string;
  required_skill: string;
  required_skill_label: string;
  options: DispatchOptionDto[];
  has_eligible_crew: boolean;
  blocked_reason: string | null;
}
