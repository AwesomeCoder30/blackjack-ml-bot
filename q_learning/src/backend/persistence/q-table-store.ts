import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import type { QTable } from "../../domain/q-learning-agent.js";
import { qTableToSerialized } from "../../domain/q-learning-agent.js";

function parsePythonKey(k: string): string | null {
  const m = k.match(/^\(\((\d+),\s*(\d+),\s*(True|False),\s*(\d+)\),\s*'(Hit|Stand|Double)'\)$/);
  if (!m) return null;
  const [, pv, dv, soft, nc, action] = m;
  const firstTurn = true;
  return JSON.stringify([
    parseInt(pv, 10),
    parseInt(dv, 10),
    soft === "True",
    parseInt(nc, 10),
    firstTurn,
    action,
  ]);
}

export function createQTableStore(filePath: string): {
  load: () => Promise<QTable>;
  save: (table: QTable) => Promise<void>;
} {
  return {
    async load(): Promise<QTable> {
      if (!existsSync(filePath)) return new Map();
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as Record<string, number>;
      const map = new Map<string, number>();
      for (const [k, v] of Object.entries(data)) {
        let key = k;
        try {
          JSON.parse(k);
        } catch {
          const converted = parsePythonKey(k);
          if (converted) key = converted;
          else continue;
        }
        map.set(key, v);
      }
      return map;
    },

    async save(table: QTable): Promise<void> {
      const dir = dirname(filePath);
      if (!existsSync(dir)) await mkdir(dir, { recursive: true });
      const obj = qTableToSerialized(table);
      await writeFile(filePath, JSON.stringify(obj), "utf-8");
    },
  };
}
