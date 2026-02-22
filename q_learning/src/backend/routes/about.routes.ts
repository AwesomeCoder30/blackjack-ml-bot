import { Router } from "express";
import type { AboutResponse } from "../../shared/api-types.js";

const about: AboutResponse = {
  title: "Blackjack Q-Learning Bot",
  description:
    "This project demonstrates a reinforcement learning (Q-learning) agent that learns to play Blackjack optimally. " +
    "You can train the bot, play against it, simulate games, and visualize its learning progress. " +
    "The project is designed for educational and research purposes, showcasing how AI can learn strategies in a classic card game.",
  motivation:
    "Blackjack is a simple yet rich environment for reinforcement learning. " +
    "The goal is to show how an agent can learn from experience, improve over time, and make decisions based on learned Q-values.",
  features: [
    "Train the bot using Q-learning",
    "Play against the bot and see its decisions",
    "Simulate full games and view step-by-step logs",
    "Save and load different trained models",
    "Visualize training progress and bot performance",
  ],
};

export function createAboutRoutes(): Router {
  const router = Router();
  router.get("/about", (_req, res) => res.json(about));
  return router;
}
