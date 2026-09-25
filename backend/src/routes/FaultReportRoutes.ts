import { Router } from "express";
import { faultReportController } from "../controllers/FaultReportController";

const router = Router();

router.get("/", faultReportController.list);
router.post("/", faultReportController.register);

export default router;
