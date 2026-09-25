import type { Request, Response, NextFunction } from "express";
import { faultReportService } from "../services/FaultReportService";

export const faultReportController = {
  list: (_req: Request, res: Response) => {
    res.json(faultReportService.list());
  },
  // POST /api/fault-report 登记故障（关联资产 + 联动健康 + 生成待派工单）
  register: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(faultReportService.register(req.body));
    } catch (err) {
      next(err);
    }
  }
};
