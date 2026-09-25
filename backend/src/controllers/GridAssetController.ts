import type { Request, Response } from "express";
import { gridAssetService } from "../services/GridAssetService";
import { asyncHandler } from "../utils/asyncHandler";

const CONTROLLER = "GridAssetController";

export const gridAssetController = {
  list: asyncHandler(CONTROLLER, (_req: Request, res: Response) => {
    res.json(gridAssetService.list());
  })
};
