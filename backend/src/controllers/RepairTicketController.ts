import type { Request, Response } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import { asyncHandler } from "../utils/asyncHandler";

const CONTROLLER = "RepairTicketController";

export const repairTicketController = {
  list: asyncHandler(CONTROLLER, (_req: Request, res: Response) => {
    res.json(repairTicketService.list());
  }),

  /** GET /api/repair-ticket/candidates?faultReportId= 候选班组与阻断原因 */
  candidates: asyncHandler(CONTROLLER, (req: Request, res: Response) => {
    const result = repairTicketService.candidates(Number(req.query.faultReportId));
    res.json(result);
  }),

  /** POST /api/repair-ticket/dispatch { fault_report_id, team_id? } */
  dispatch: asyncHandler(CONTROLLER, (req: Request, res: Response) => {
    const actor = (req as unknown as { user: { name?: string } }).user?.name ?? "调度值班员";
    const ticket = repairTicketService.dispatch(req.body, actor);
    res.status(201).json(ticket);
  }),

  /** POST /api/repair-ticket/:id/arrive 到场 */
  arrive: asyncHandler(CONTROLLER, (req: Request, res: Response) => {
    res.json(repairTicketService.progress(Number(req.params.id), "班组长"));
  }),

  /** POST /api/repair-ticket/:id/repair 开始抢修 */
  repair: asyncHandler(CONTROLLER, (req: Request, res: Response) => {
    res.json(repairTicketService.progress(Number(req.params.id), "班组长"));
  }),

  /** POST /api/repair-ticket/:id/restore 复电确认：释放班组、恢复资产健康 */
  restore: asyncHandler(CONTROLLER, (req: Request, res: Response) => {
    const actor = (req as unknown as { user: { name?: string } }).user?.name ?? "调度值班员";
    res.json(repairTicketService.restore(Number(req.params.id), actor));
  })
};
