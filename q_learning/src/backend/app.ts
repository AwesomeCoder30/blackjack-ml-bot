import express from "express";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { mountRoutes } from "./routes/index.js";
import { createBotService } from "./services/bot-service.js";
import { createTrainingResultsService } from "./services/training-results.service.js";
import { loadConfig } from "./persistence/config-store.js";
import { createQTableStore } from "./persistence/q-table-store.js";
import { createResultsCsvStore } from "./persistence/results-csv-store.js";
import { BlackjackBot } from "../domain/blackjack-bot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp(dataDir: string) {
  const configPath = path.join(dataDir, "config.json");
  const config = await loadConfig(configPath);

  const qStore = createQTableStore(path.join(dataDir, "q_table.json"));
  const resultsStore = createResultsCsvStore(path.join(dataDir, "blackjack_results.csv"));
  const bot = new BlackjackBot(config, qStore, resultsStore);
  await bot.loadQTable();

  const botService = createBotService({ bot, dataDir });
  const trainingService = createTrainingResultsService(
    path.join(dataDir, "blackjack_results.csv")
  );

  const app = express();
  app.use(express.json());
  app.use(mountRoutes(botService, trainingService));

  const publicDir = path.join(__dirname, "..", "..", "..", "dist", "public");
  if (existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  return app;
}
