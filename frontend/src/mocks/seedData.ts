/**
 * 本地静态兜底数据：仅在后端完全不可达、且调用方显式引用时使用。
 * 正常运行时前端一律请求 /api，真实数据由后端 data.json 持久化。
 * 与后端 buildSeed() 保持同一业务场景的精简版。
 */
import { FaultTypeText } from "../constants/FaultType";
import { TicketStatusText } from "../constants/TicketStatus";
import { AssetHealthStatusText } from "../constants/AssetHealthStatus";

export const mockEnums = {
  FaultTypeText,
  TicketStatusText,
  AssetHealthStatusText
};

export const mockData = {
  gridAsset: [] as Array<Record<string, unknown>>,
  faultReport: [] as Array<Record<string, unknown>>,
  repairTicket: [] as Array<Record<string, unknown>>,
  crew: [] as Array<Record<string, unknown>>,
  sparePartUsage: [] as Array<Record<string, unknown>>
};
