import type { GridAsset } from "../models/GridAsset";

export const createGridAssetDto = (row: GridAsset) => ({ ...row });
export const createGridAssetListDto = (rows: GridAsset[]) => rows.map(createGridAssetDto);
