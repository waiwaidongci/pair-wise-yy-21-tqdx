import type { Request, Response } from "express";
import { gridAssetService } from "../services/GridAssetService";

export const gridAssetController = {
  list: (req: Request, res: Response) => {
    const feederLine = typeof req.query.feeder_line === "string" ? req.query.feeder_line : undefined;
    res.json(gridAssetService.listByFeederLine(feederLine));
  }
};
