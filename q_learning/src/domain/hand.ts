import { CARD_VALUES, type Card, type HandValue } from "./types.js";

export function handValue(hand: Card[]): HandValue {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    value += CARD_VALUES[card] ?? 0;
    if (card === "A") aces++;
  }
  const soft = aces > 0;
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return { total: value, soft };
}
