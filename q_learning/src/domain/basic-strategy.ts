import { CARD_VALUES } from "./types.js";
import { handValue } from "./hand.js";

export type BasicStrategyAction = "Hit" | "Stand" | "Double" | "Split";

const D = "Double";
const H = "Hit";
const S = "Stand";
const P = "Split";

type Cell = typeof H | typeof S | typeof D | typeof P;

function dealerIndex(card: string): number {
  const v = CARD_VALUES[card];
  return v === 11 ? 11 : v ?? 10;
}

const HARD: Record<number, Cell[]> = {
  4: [H, H, H, H, H, H, H, H, H, H],
  5: [H, H, H, H, H, H, H, H, H, H],
  6: [H, H, H, H, H, H, H, H, H, H],
  7: [H, H, H, H, H, H, H, H, H, H],
  8: [H, H, H, H, H, H, H, H, H, H],
  9: [D, D, D, D, D, H, H, H, H, H],
  10: [D, D, D, D, D, D, D, D, H, H],
  11: [D, D, D, D, D, D, D, D, D, H],
  12: [H, H, S, S, S, H, H, H, H, H],
  13: [S, S, S, S, S, H, H, H, H, H],
  14: [S, S, S, S, S, H, H, H, H, H],
  15: [S, S, S, S, S, H, H, H, H, H],
  16: [S, S, S, S, S, H, H, H, H, H],
};

const SOFT: Record<number, Cell[]> = {
  13: [H, H, H, D, D, H, H, H, H, H],
  14: [H, H, H, D, D, H, H, H, H, H],
  15: [H, H, D, D, D, H, H, H, H, H],
  16: [H, H, D, D, D, H, H, H, H, H],
  17: [H, D, D, D, D, H, H, H, H, H],
  18: [S, D, D, D, D, S, S, H, H, H],
  19: [S, S, S, S, S, S, S, S, S, S],
  20: [S, S, S, S, S, S, S, S, S, S],
};

const PAIR: Record<number, Cell[]> = {
  2: [P, P, P, P, P, P, P, H, H, H],
  3: [P, P, P, P, P, P, P, P, H, H],
  4: [H, H, H, P, P, H, H, H, H, H],
  5: [D, D, D, D, D, D, D, D, H, H],
  6: [P, P, P, P, P, P, H, H, H, H],
  7: [P, P, P, P, P, P, P, H, H, H],
  8: [P, P, P, P, P, P, P, P, P, P],
  9: [P, P, P, P, P, S, P, P, S, S],
  10: [S, S, S, S, S, S, S, S, S, S],
  11: [P, P, P, P, P, P, P, P, P, P],
};

function lookup(table: Record<number, Cell[]>, row: number, dealerVal: number): Cell {
  const rowData = table[row];
  if (!rowData) return H;
  const c = dealerVal === 11 ? 9 : dealerVal - 2;
  return rowData[c] ?? H;
}

export function getBasicStrategy(playerHand: string[], dealerCard: string): BasicStrategyAction {
  const dealerVal = dealerIndex(dealerCard);

  if (playerHand.length === 2) {
    const [a, b] = playerHand;
    const v1 = CARD_VALUES[a] ?? 10;
    const v2 = CARD_VALUES[b] ?? 10;
    if (a === b || (v1 === 10 && v2 === 10)) {
      const pairVal = a === "A" ? 11 : v1;
      const cell = lookup(PAIR, pairVal, dealerVal);
      return cell === P ? "Split" : cell === D ? "Double" : cell === S ? "Stand" : "Hit";
    }
  }

  const { total, soft } = handValue(playerHand);
  if (total >= 22) return "Stand";
  if (total >= 17 && !soft) return "Stand";
  if (total >= 19 && soft) return "Stand";

  if (soft) {
    if (total >= 13 && total <= 20) {
      const cell = lookup(SOFT, total, dealerVal);
      return cell === D ? "Double" : cell === S ? "Stand" : "Hit";
    }
    return "Hit";
  }

  if (total >= 4 && total <= 16) {
    const cell = lookup(HARD, total, dealerVal);
    return cell === D ? "Double" : cell === S ? "Stand" : "Hit";
  }

  return total >= 17 ? "Stand" : "Hit";
}
