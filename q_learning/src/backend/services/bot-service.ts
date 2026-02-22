import type { BlackjackBot } from "../../domain/blackjack-bot.js";
import { getBasicStrategy } from "../../domain/basic-strategy.js";
import type { PlayResponse, SimulateResponse, EvaluateResponse } from "../../shared/api-types.js";
import { createQTableStore } from "../persistence/q-table-store.js";
import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export interface BotServiceDeps {
  bot: BlackjackBot;
  dataDir: string;
}

export function createBotService(deps: BotServiceDeps) {
  const { bot, dataDir } = deps;
  const savedDir = path.join(dataDir, "saved_models");

  return {
    async getAction(playerHand: string[], dealerCard: string): Promise<PlayResponse> {
      await bot.loadQTable();
      const state = bot.toState(playerHand, dealerCard);
      bot.setEpsilon(0);
      const action = bot.chooseAction(state, false);
      const q = bot.getQ(state, action);
      const raw = 100 * (q + 1) / 2;
      const confidence = Math.round(Math.min(100, Math.max(0, raw)));
      const basicStrategy = getBasicStrategy(playerHand, dealerCard);
      return { action, confidence, basicStrategy };
    },

    async train(episodes: number): Promise<{ message: string }> {
      await bot.loadQTable();
      await bot.train(episodes);
      return { message: `Training completed for ${episodes} episodes.` };
    },

    async evaluate(numGames: number): Promise<EvaluateResponse> {
      await bot.loadQTable();
      return bot.evaluate(numGames);
    },

    async runSimulation(): Promise<SimulateResponse> {
      await bot.loadQTable();
      const result = bot.runSimulation();
      return {
        log: result.log,
        final_player_hand: result.final_player_hand,
        final_dealer_hand: result.final_dealer_hand,
        player_score: result.player_score,
        dealer_score: result.dealer_score,
        outcome: result.outcome,
      };
    },

    async saveModel(name: string): Promise<{ message: string }> {
      if (!name.trim()) throw new Error("Name required");
      const store = createQTableStore(path.join(savedDir, `q_table_${name}.json`));
      await store.save(bot.getQTable());
      return { message: `Bot saved as '${name}'.` };
    },

    async loadModel(name: string): Promise<{ message: string }> {
      if (!name.trim()) throw new Error("Name required");
      const filePath = path.join(savedDir, `q_table_${name}.json`);
      if (!existsSync(filePath)) throw new Error("Model not found");
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as Record<string, number>;
      bot.loadQTableFromData(data);
      return { message: `Bot '${name}' loaded successfully.` };
    },

    async listModels(): Promise<{ models: string[] }> {
      if (!existsSync(savedDir)) return { models: [] };
      const files = await readdir(savedDir);
      const models = files
        .filter((f) => f.startsWith("q_table_") && f.endsWith(".json"))
        .map((f) => f.replace("q_table_", "").replace(".json", ""));
      return { models };
    },
  };
}

export type BotService = ReturnType<typeof createBotService>;
