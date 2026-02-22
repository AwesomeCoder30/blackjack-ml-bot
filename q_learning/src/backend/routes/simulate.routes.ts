import { Router } from "express";
import type { BotService } from "../services/bot-service.js";

export function createSimulateRoutes(botService: BotService): Router {
  const router = Router();

  router.post("/simulate", async (_req, res) => {
    try {
      const result = await botService.runSimulation();
      return res.json(result);
    } catch (e) {
      return res.status(400).json({ error: String(e) });
    }
  });

  return router;
}
