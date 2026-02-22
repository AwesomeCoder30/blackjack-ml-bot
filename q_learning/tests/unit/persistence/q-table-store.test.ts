import { describe, it, expect, beforeEach } from "vitest";
import { createQTableStore } from "../../../src/backend/persistence/q-table-store.js";
import { mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

describe("QTableStore", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "qtable-"));
  });

  it("returns empty map when file does not exist", async () => {
    const store = createQTableStore(join(dir, "missing.json"));
    const table = await store.load();
    expect(table.size).toBe(0);
  });

  it("round-trips Q-table with JSON keys", async () => {
    const path = join(dir, "q.json");
    const store = createQTableStore(path);
    const key = JSON.stringify([18, 10, false, 2, true, "stand"]);
    const table = new Map<string, number>();
    table.set(key, 0.5);
    await store.save(table);
    const loaded = await store.load();
    expect(loaded.get(key)).toBe(0.5);
    expect(loaded.size).toBe(1);
  });
});
