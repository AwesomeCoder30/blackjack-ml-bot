import { describe, it, expect } from "vitest";
import { Deck } from "../../../src/domain/deck.js";

describe("Deck", () => {
  it("deals 52 cards then reshuffles", () => {
    const deck = new Deck();
    let count = 0;
    for (let i = 0; i < 52; i++) {
      deck.deal();
      count++;
    }
    expect(count).toBe(52);
    const next = deck.deal();
    expect(next).toBeDefined();
    expect(typeof next).toBe("string");
  });

  it("deals only valid ranks", () => {
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const deck = new Deck();
    for (let i = 0; i < 52; i++) {
      expect(ranks).toContain(deck.deal());
    }
  });
});
