import type { Request, Response } from "express";
import { crewService } from "../services/CrewService";
import { asyncHandler } from "../utils/asyncHandler";

const CONTROLLER = "CrewController";

export const crewController = {
  list: asyncHandler(CONTROLLER, (_req: Request, res: Response) => {
    res.json(crewService.list());
  })
};
