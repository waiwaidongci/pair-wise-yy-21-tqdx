import type { Request, Response } from "express";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { asyncHandler } from "../utils/asyncHandler";

const CONTROLLER = "SparePartUsageController";

export const sparePartUsageController = {
  list: asyncHandler(CONTROLLER, (_req: Request, res: Response) => {
    res.json(sparePartUsageService.list());
  })
};
