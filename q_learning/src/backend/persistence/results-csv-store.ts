import { appendFile } from "fs/promises";
import { existsSync } from "fs";

export function createResultsCsvStore(filePath: string): {
  append: (episode: number, wins: number, losses: number, ties: number) => Promise<void>;
} {
  return {
    async append(episode: number, wins: number, losses: number, ties: number): Promise<void> {
      const header = "Episode,Wins,Losses,Ties\n";
      const line = `${episode},${wins},${losses},${ties}\n`;
      if (!existsSync(filePath)) {
        await appendFile(filePath, header + line, "utf-8");
      } else {
        await appendFile(filePath, line, "utf-8");
      }
    },
  };
}
