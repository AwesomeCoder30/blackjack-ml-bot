import { Router } from "express";
import type { BotService } from "../services/bot-service.js";

export function createModelsRoutes(botService: BotService): Router {
  const router = Router();

  router.post("/save_model", async (req, res) => {
    try {
      const name = req.body?.name;
      const result = await botService.saveModel(name ?? "");
      return res.json(result);
    } catch (e) {
      const msg = String(e);
      if (msg === "Name required") return res.status(400).json({ error: msg });
      if (msg === "Model not found") return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  });

  router.post("/load_model", async (req, res) => {
    try {
      const name = req.body?.name;
      const result = await botService.loadModel(name ?? "");
      return res.json(result);
    } catch (e) {
      const msg = String(e);
      if (msg === "Name required") return res.status(400).json({ error: msg });
      if (msg === "Model not found") return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  });

  router.get("/list_models", async (_req, res) => {
    try {
      const result = await botService.listModels();
      return res.json(result);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  });

  return router;
}
