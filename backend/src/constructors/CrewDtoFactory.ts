import type { Crew } from "../models/Crew";
import type { FaultReport } from "../models/FaultReport";
import type { CrewDispatchProfile } from "../types/DispatchDecision";

/** 班组列表 DTO：附带占用工单号，页面展示当前占用。 */
export function createCrewDto(crew: Crew, occupiedTicketNo: string | null = null) {
  return {
    ...crew,
    occupied_ticket_no: occupiedTicketNo,
    available: crew.duty_status === "ON_DUTY" && crew.current_ticket_id == null
  };
}

/** 派工候选评估 DTO：含故障所需技能与每个班组的阻断原因。 */
export function createCrewAvailabilityDto(
  fault: FaultReport,
  requiredSkills: string[],
  profiles: CrewDispatchProfile[]
) {
  return {
    fault_report_id: fault.id,
    fault_no: fault.fault_no,
    fault_type: fault.fault_type,
    required_skills: requiredSkills,
    available_count: profiles.filter((profile) => profile.eligible).length,
    crews: profiles
  };
}
