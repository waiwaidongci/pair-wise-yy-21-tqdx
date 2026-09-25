import { Router } from "express";
import { crewController } from "../controllers/CrewController";

const router = Router();
router.get("/", crewController.list);

export default router;
