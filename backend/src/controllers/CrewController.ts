import type { Request, Response } from "express";
import { crewService } from "../services/CrewService";

export const crewController = {
  list: (_req: Request, res: Response) => {
    res.json(crewService.list());
  },
  // GET /api/crew/occupancy 当前占用一览
  occupancy: (_req: Request, res: Response) => {
    res.json(crewService.occupancy());
  }
};
