import { request } from "./client";
import type { SparePartUsage } from "../types/SparePartUsage";

export function listSparePartUsage(): Promise<SparePartUsage[]> {
  return request<SparePartUsage[]>("/spare-part-usage");
}
