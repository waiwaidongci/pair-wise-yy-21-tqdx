import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";

const router = Router();
router.get("/", repairTicketController.list);
router.get("/candidates", repairTicketController.candidates);
router.post("/dispatch", repairTicketController.dispatch);
router.post("/:id/arrive", repairTicketController.arrive);
router.post("/:id/repair", repairTicketController.repair);
router.post("/:id/restore", repairTicketController.restore);

export default router;
