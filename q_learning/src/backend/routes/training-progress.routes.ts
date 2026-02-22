import { Router } from "express";
import type { TrainingResultsService } from "../services/training-results.service.js";


export function createTrainingProgressRoutes(service: TrainingResultsService): Router {
  const router = Router();
  router.get("/training_progress", async (_req, res) => {
    try {
      const lastN = Number(_req.query.n) || 100;
      const points = await service.getProgress(lastN);
      return res.json({ points });
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  });
  return router;
}
