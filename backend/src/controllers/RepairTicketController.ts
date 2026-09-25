import type { Request, Response, NextFunction } from "express";
import { repairTicketService } from "../services/RepairTicketService";

export const repairTicketController = {
  list: (_req: Request, res: Response) => {
    res.json(repairTicketService.list());
  },
  // GET /api/repair-ticket/:id/dispatch-plan 派工候选 + 每班组阻断原因
  dispatchPlan: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(repairTicketService.dispatchPlan(Number(req.params.id)));
    } catch (err) {
      // controller 层包装：规则错误统一转 4xx 响应
      next(err);
    }
  },
  // POST /api/repair-ticket/:id/dispatch
  dispatch: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(repairTicketService.dispatch(Number(req.params.id), req.body));
    } catch (err) {
      next(err);
    }
  },
  // POST /api/repair-ticket/:id/advance 到场/抢修中
  advance: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(repairTicketService.advance(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  },
  // POST /api/repair-ticket/:id/restore 复电确认
  restore: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(repairTicketService.restore(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }
};
