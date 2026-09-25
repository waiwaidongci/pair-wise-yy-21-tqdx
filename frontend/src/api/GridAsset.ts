import { get } from "./client";
import { mockData } from "../mocks/seedData";
import type { GridAsset } from "../types/GridAsset";

const endpoint = "/api/grid-asset";

export async function listGridAsset(feederLine?: string): Promise<GridAsset[]> {
  try {
    const query = feederLine ? `?feeder_line=${encodeURIComponent(feederLine)}` : "";
    return await get<GridAsset[]>(`${endpoint}${query}`);
  } catch {
    return mockData.gridAsset.filter((row) => !feederLine || row.feeder_line === feederLine);
  }
}
