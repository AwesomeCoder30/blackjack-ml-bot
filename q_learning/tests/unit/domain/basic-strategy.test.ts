import { describe, it, expect } from "vitest";
import { getBasicStrategy } from "../../../src/domain/basic-strategy.js";

describe("getBasicStrategy", () => {
  it("hard 16 vs 10: Hit", () => {
    expect(getBasicStrategy(["10", "6"], "10")).toBe("Hit");
  });

  it("hard 11 vs 5: Double", () => {
    expect(getBasicStrategy(["6", "5"], "5")).toBe("Double");
  });

  it("hard 17+: Stand", () => {
    expect(getBasicStrategy(["10", "7"], "9")).toBe("Stand");
  });

  it("soft 18 vs 3: Double", () => {
    expect(getBasicStrategy(["A", "7"], "3")).toBe("Double");
  });

  it("pair 8s: Split", () => {
    expect(getBasicStrategy(["8", "8"], "10")).toBe("Split");
  });

  it("pair 10s: Stand", () => {
    expect(getBasicStrategy(["10", "K"], "6")).toBe("Stand");
  });

  it("pair Aces: Split", () => {
    expect(getBasicStrategy(["A", "A"], "9")).toBe("Split");
  });
});
