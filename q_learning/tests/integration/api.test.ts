import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../../src/backend/app.js";
import request from "supertest";
import path from "path";
import { mkdtemp, writeFile, mkdir, rm } from "fs/promises";
import { tmpdir } from "os";

describe("API", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  let dataDir: string;

  beforeAll(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "bj-api-"));
    await mkdir(path.join(dataDir, "saved_models"), { recursive: true });
    await writeFile(
      path.join(dataDir, "config.json"),
      JSON.stringify({
        learning_rate: 0.05,
        discount_factor: 0.95,
        epsilon_start: 0,
        epsilon_decay: 0.999,
        min_epsilon: 0.01,
        training_episodes: 1000,
        evaluation_games: 10,
      }),
      "utf-8"
    );
    app = await createApp(dataDir);
  });

  afterAll(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("GET /about returns about payload", async () => {
    const res = await request(app).get("/about");
    expect(res.status).toBe(200);
    expect(res.body?.title).toBeDefined();
    expect(res.body?.features).toBeInstanceOf(Array);
  });

  it("POST /play returns action and confidence", async () => {
    const res = await request(app)
      .post("/play")
      .send({ player_hand: ["10", "9"], dealer_card: "7" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    expect(["Hit", "Stand", "Double"]).toContain(res.body?.action);
    expect(typeof res.body?.confidence).toBe("number");
  });

  it("GET /evaluate returns WIN LOSS TIE counts", async () => {
    const res = await request(app).get("/evaluate");
    expect(res.status).toBe(200);
    expect(typeof res.body?.WIN).toBe("number");
    expect(typeof res.body?.LOSS).toBe("number");
    expect(typeof res.body?.TIE).toBe("number");
  });

  it("POST /simulate returns log and outcome", async () => {
    const res = await request(app).post("/simulate").set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.log)).toBe(true);
    expect(["WIN", "LOSS", "TIE"]).toContain(res.body?.outcome);
  });

  it("GET /list_models returns models array", async () => {
    const res = await request(app).get("/list_models");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.models)).toBe(true);
  });
});
