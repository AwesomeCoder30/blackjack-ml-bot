import { describe, it, expect } from "vitest";
import { handValue } from "../../../src/domain/hand.js";

describe("handValue", () => {
  it("sums numeric cards", () => {
    expect(handValue(["5", "7"])).toEqual({ total: 12, soft: false });
  });

  it("counts face cards as 10", () => {
    expect(handValue(["K", "Q"])).toEqual({ total: 20, soft: false });
  });

  it("treats one Ace as 11 when under 21", () => {
    expect(handValue(["A", "9"])).toEqual({ total: 20, soft: true });
  });

  it("treats Ace as 1 when 11 would bust", () => {
    const r = handValue(["A", "K", "5"]);
    expect(r.total).toBe(16);
    expect(r.soft).toBe(true);
  });

  it("returns 21 for blackjack", () => {
    expect(handValue(["A", "K"])).toEqual({ total: 21, soft: true });
  });

  it("returns bust over 21", () => {
    expect(handValue(["K", "K", "5"])).toEqual({ total: 25, soft: false });
  });

  it("soft 17", () => {
    expect(handValue(["A", "6"])).toEqual({ total: 17, soft: true });
  });
});
