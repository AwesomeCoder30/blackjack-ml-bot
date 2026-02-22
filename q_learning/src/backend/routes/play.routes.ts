import { Router } from "express";
import type { BotService } from "../services/bot-service.js";

export function createPlayRoutes(botService: BotService): Router {
  const router = Router();

  router.post("/play", async (req, res) => {
    try {
      const body = req.body;
      if (!body?.player_hand || !body?.dealer_card) {
        return res.status(400).json({ error: "Invalid or empty JSON payload" });
      }
      const playerHand = (body.player_hand as string[]).map((c: string) => String(c).trim());
      const dealerCard = String(body.dealer_card).trim();
      const result = await botService.getAction(playerHand, dealerCard);
      return res.json(result);
    } catch (e) {
      return res.status(400).json({ error: String(e) });
    }
  });

  return router;
}
