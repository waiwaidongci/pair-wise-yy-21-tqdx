import { reader } from "../store/dataStore";

function datePart(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

/** 业务编号：故障 GZ-yyyyMMdd-序号 / 工单 WO-yyyyMMdd-序号，序号取表内当前条数。 */
export function nextFaultNo(): string {
  const count = reader().faultReport.length + 1;
  return `GZ-${datePart()}-${String(count).padStart(3, "0")}`;
}

export function nextTicketNo(): string {
  const count = reader().repairTicket.length + 1;
  return `WO-${datePart()}-${String(count).padStart(3, "0")}`;
}
