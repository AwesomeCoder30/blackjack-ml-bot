import type { Action, GameOutcome, GameState } from "../shared/api-types.js";

export type Card = string;

export const CARD_VALUES: Record<string, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  "10": 10, "J": 10, "Q": 10, "K": 10, "A": 11,
};

export const ACTIONS: readonly Action[] = ["Hit", "Stand", "Double"];

export interface HandValue {
  total: number;
  soft: boolean;
}

export type { GameState };

export function stateKey(state: GameState, action: Action): string {
  return JSON.stringify([
    state.playerValue,
    state.dealerCardValue,
    state.soft,
    state.numCards,
    state.firstTurn,
    action,
  ]);
}

export function parseStateKey(key: string): { state: GameState; action: Action } {
  const [playerValue, dealerCardValue, soft, numCards, firstTurn, action] = JSON.parse(key);
  return {
    state: { playerValue, dealerCardValue, soft, numCards, firstTurn },
    action,
  };
}

export type { Action, GameOutcome };
