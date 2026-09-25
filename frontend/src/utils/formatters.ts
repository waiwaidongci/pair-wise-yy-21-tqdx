import { TicketStatusText } from "../constants/TicketStatus";
import { AssetHealthStatusText } from "../constants/AssetHealthStatus";
import { FaultStatusText } from "../constants/FaultStatus";
import { FaultTypeText } from "../constants/FaultType";
import { CrewDutyStatusText } from "../constants/CrewDutyStatus";
import { SEVERITY_TEXT } from "../constants/skillLabels";
import type { FaultType } from "../constants/FaultType";
import type { TicketStatus } from "../constants/TicketStatus";
import type { AssetHealthStatus } from "../constants/AssetHealthStatus";
import type { FaultStatus } from "../constants/FaultStatus";

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

export function formatTicketStatus(value: string): string {
  return TicketStatusText[value as TicketStatus] ?? value;
}

export function formatHealthStatus(value: string): string {
  return AssetHealthStatusText[value as AssetHealthStatus] ?? value;
}

export function formatFaultStatus(value: string): string {
  return FaultStatusText[value as FaultStatus] ?? value;
}

export function formatFaultType(value: string): string {
  return FaultTypeText[value as FaultType] ?? value;
}

export function formatDutyStatus(value: string): string {
  return CrewDutyStatusText[value as keyof typeof CrewDutyStatusText] ?? value;
}

export function formatSeverity(value: string): string {
  return SEVERITY_TEXT[value] ?? value;
}

/** 复电耗时（分钟），用于态势页平均复电时长。 */
export function durationMinutes(assignedAt: string | null, restoredAt: string | null): number | null {
  if (!assignedAt || !restoredAt) return null;
  const ms = new Date(restoredAt).getTime() - new Date(assignedAt).getTime();
  return Math.max(0, Math.round(ms / 60000));
}
