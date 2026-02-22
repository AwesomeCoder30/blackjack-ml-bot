import { CARD_VALUES, type Card } from "./types.js";

const RANKS = Object.keys(CARD_VALUES);
const FULL_DECK: Card[] = RANKS.flatMap((r) => [r, r, r, r]);

export class Deck {
  private cards: Card[] = [];

  shuffle(): void {
    this.cards = [...FULL_DECK];
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(): Card {
    if (this.cards.length === 0) this.shuffle();
    return this.cards.pop()!;
  }
}
