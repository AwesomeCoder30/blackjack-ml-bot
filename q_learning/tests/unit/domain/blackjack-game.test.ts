import { describe, it, expect } from "vitest";
import { playOneRound } from "../../../src/domain/blackjack-game.js";
import { Deck } from "../../../src/domain/deck.js";
import type { GameState } from "../../../src/shared/api-types.js";

describe("playOneRound", () => {
  it("returns outcome and steps", () => {
    const deck = new Deck();
    const alwaysStand = (_s: GameState) => "Stand" as const;
    const result = playOneRound(deck, alwaysStand);
    expect(["WIN", "LOSS", "TIE"]).toContain(result.outcome);
    expect(result.steps.length).toBeGreaterThanOrEqual(1);
    expect(result.playerHand.length).toBeGreaterThanOrEqual(2);
    expect(result.dealerHand.length).toBeGreaterThanOrEqual(2);
  });

  it("busts when always hit", () => {
    const deck = new Deck();
    const alwaysHit = (_s: GameState) => "Hit" as const;
    const result = playOneRound(deck, alwaysHit);
    expect(result.outcome).toBe("LOSS");
    expect(result.playerScore).toBeGreaterThan(21);
  });
});
