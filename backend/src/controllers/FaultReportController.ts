import type { Request, Response } from "express";
import { faultReportService } from "../services/FaultReportService";
import { asyncHandler } from "../utils/asyncHandler";

const CONTROLLER = "FaultReportController";

export const faultReportController = {
  list: asyncHandler(CONTROLLER, (_req: Request, res: Response) => {
    res.json(faultReportService.list());
  }),

  /** POST /api/fault-report 登记故障并关联资产（资产健康同步降级） */
  create: asyncHandler(CONTROLLER, (req: Request, res: Response) => {
    const actor = (req as unknown as { user: { name?: string } }).user?.name ?? "调度值班员";
    res.status(201).json(faultReportService.create(req.body, actor));
  })
};
