import { readFile } from "fs/promises";
import { existsSync } from "fs";
import type { TrainingProgressPoint } from "../../shared/api-types.js";

export type TrainingResultsService = ReturnType<typeof createTrainingResultsService>;

export function createTrainingResultsService(csvPath: string): {
  getProgress: (lastN?: number) => Promise<TrainingProgressPoint[]>;
} {
  return {
    async getProgress(lastN = 100): Promise<TrainingProgressPoint[]> {
      if (!existsSync(csvPath)) return [];
      const raw = await readFile(csvPath, "utf-8");
      const lines = raw.trim().split("\n");
      if (lines.length < 2) return [];

      const rows = lines.slice(1).map((line) => {
        const [episode, wins, losses, ties] = line.split(",").map(Number);
        const total = wins + losses + ties;
        const winRate = total > 0 ? wins / total : 0;
        return { episode, winRate };
      });

      return rows.slice(-lastN);
    },
  };
}
