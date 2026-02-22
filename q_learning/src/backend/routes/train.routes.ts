import { Router } from "express";
import type { BotService } from "../services/bot-service.js";

export function createTrainRoutes(botService: BotService): Router {
  const router = Router();

  router.post("/train", async (req, res) => {
    try {
      const episodes = Number(req.body?.episodes) || 50000;
      const result = await botService.train(episodes);
      return res.json(result);
    } catch (e) {
      return res.status(400).json({ error: String(e) });
    }
  });

  router.get("/evaluate", async (_req, res) => {
    try {
      const result = await botService.evaluate(100);
      return res.json(result);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  });

  return router;
}
