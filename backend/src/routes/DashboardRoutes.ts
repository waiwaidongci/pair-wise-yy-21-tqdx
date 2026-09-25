import { Router } from "express";
import { dashboardController } from "../controllers/DashboardController";

const router = Router();

router.get("/", dashboardController.overview);

export default router;
