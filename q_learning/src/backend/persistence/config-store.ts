import { readFile } from "fs/promises";
import { existsSync } from "fs";
import type { Config } from "../../shared/api-types.js";

export async function loadConfig(filePath: string): Promise<Config> {
  if (!existsSync(filePath)) {
    throw new Error(`Config not found: ${filePath}`);
  }
  const raw = await readFile(filePath, "utf-8");
  const data = JSON.parse(raw);
  return {
    learning_rate: data.learning_rate ?? 0.05,
    discount_factor: data.discount_factor ?? 0.95,
    epsilon_start: data.epsilon_start ?? 1,
    epsilon_decay: data.epsilon_decay ?? 0.9995,
    min_epsilon: data.min_epsilon ?? 0.01,
    training_episodes: data.training_episodes ?? 250000,
    evaluation_games: data.evaluation_games ?? 100,
  };
}
