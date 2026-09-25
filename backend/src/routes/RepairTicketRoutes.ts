import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";

const router = Router();

router.get("/", repairTicketController.list);
router.get("/:id/dispatch-plan", repairTicketController.dispatchPlan);
router.post("/:id/dispatch", repairTicketController.dispatch);
router.post("/:id/advance", repairTicketController.advance);
router.post("/:id/restore", repairTicketController.restore);

export default router;
