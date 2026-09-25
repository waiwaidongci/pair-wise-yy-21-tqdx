import { request } from "./client";
import type { GridAsset } from "../types/GridAsset";

export function listGridAsset(): Promise<GridAsset[]> {
  return request<GridAsset[]>("/grid-asset");
}
