import { Router } from "express";
import type { Request, Response } from "express";
import { auditLogRepository } from "../repositories/AuditLogRepository";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
router.get(
  "/",
  asyncHandler("AuditLogController", (_req: Request, res: Response) => {
    res.json(auditLogRepository.findAll());
  })
);

export default router;
