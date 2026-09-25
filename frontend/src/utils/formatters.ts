import { TicketStatusText } from "../constants/TicketStatus";
import { AssetHealthStatusText } from "../constants/AssetHealthStatus";
import { FaultTypeText } from "../constants/FaultType";
import { DutyStatusText } from "../constants/DutyStatus";
import { SeverityText } from "../constants/Severity";
import { SkillText } from "../constants/FaultType";

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";

export const formatStatus = (value: string) =>
  TicketStatusText[value as keyof typeof TicketStatusText] ?? value.replace(/_/g, " ");

export const formatHealth = (value: string) =>
  AssetHealthStatusText[value as keyof typeof AssetHealthStatusText] ?? value;

export const formatFaultType = (value: string) =>
  FaultTypeText[value as keyof typeof FaultTypeText] ?? value;

export const formatDuty = (value: string) =>
  DutyStatusText[value as keyof typeof DutyStatusText] ?? value;

export const formatSeverity = (value: string) =>
  SeverityText[value as keyof typeof SeverityText] ?? value;

export const formatSkill = (value: string) => SkillText[value] ?? value;

export const formatSkills = (skills: string[]) =>
  skills.length ? skills.map(formatSkill).join("、") : "无技能标签";

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatRisk = (value: string) => SeverityText[value as keyof typeof SeverityText] ?? value;

// 毫秒 -> 「x 小时 y 分钟」
export const formatDurationMinutes = (minutes: number) => {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} 小时 ${m} 分钟` : `${m} 分钟`;
};
