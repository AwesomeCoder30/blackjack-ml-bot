import type { GameState } from "../shared/api-types.js";
import type { Action, GameOutcome } from "../shared/api-types.js";
import type { Card } from "./types.js";
import { handValue } from "./hand.js";
import { CARD_VALUES } from "./types.js";
import { Deck } from "./deck.js";

export interface RoundStep {
  state: GameState;
  action: Action;
  nextState: GameState | null;
  reward: number;
}

export interface RoundResult {
  outcome: GameOutcome;
  steps: RoundStep[];
  playerHand: Card[];
  dealerHand: Card[];
  playerScore: number;
  dealerScore: number;
}

function toState(
  playerValue: number,
  dealerCardValue: number,
  soft: boolean,
  numCards: number,
  firstTurn: boolean
): GameState {
  return { playerValue, dealerCardValue, soft, numCards, firstTurn };
}

export function playOneRound(
  deck: Deck,
  chooseAction: (state: GameState) => Action
): RoundResult {
  const playerHand: Card[] = [deck.deal(), deck.deal()];
  const dealerCard = deck.deal();
  const dealerHand: Card[] = [dealerCard, deck.deal()];
  const dealerCardValue = CARD_VALUES[dealerCard] ?? 0;

  let { total: playerValue, soft } = handValue(playerHand);
  let state = toState(playerValue, dealerCardValue, soft, playerHand.length, true);
  const steps: RoundStep[] = [];

  while (true) {
    const action = chooseAction(state);

    if (action === "Hit") {
      playerHand.push(deck.deal());
      const next = handValue(playerHand);
      const nextState = toState(
        next.total,
        dealerCardValue,
        next.soft,
        playerHand.length,
        false
      );
      if (next.total > 21) {
        steps.push({ state, action, nextState, reward: -1 });
        return {
          outcome: "LOSS",
          steps,
          playerHand,
          dealerHand,
          playerScore: next.total,
          dealerScore: handValue(dealerHand).total,
        };
      }
      steps.push({ state, action, nextState, reward: 0 });
      state = nextState;
      playerValue = next.total;
      soft = next.soft;
    } else if (action === "Double" && playerHand.length === 2 && playerValue < 21) {
      playerHand.push(deck.deal());
      const next = handValue(playerHand);
      const nextState = toState(
        next.total,
        dealerCardValue,
        next.soft,
        playerHand.length,
        false
      );
      const reward = next.total <= 21 ? 2 : -2;
      steps.push({ state, action, nextState, reward });
      return {
        outcome: reward > 0 ? "WIN" : "LOSS",
        steps,
        playerHand,
        dealerHand,
        playerScore: next.total,
        dealerScore: handValue(dealerHand).total,
      };
    } else {
      break;
    }
  }

  let dealerScore = handValue(dealerHand).total;
  while (dealerScore < 17) {
    dealerHand.push(deck.deal());
    dealerScore = handValue(dealerHand).total;
  }

  const playerScore = handValue(playerHand).total;
  let reward = 0;
  if (playerScore === 21 && playerHand.length === 2) reward = 2;
  else if (playerScore > 21) reward = -1;
  else if (dealerScore > 21 || playerScore > dealerScore) reward = 1;
  else if (playerScore < dealerScore) reward = -1;

  steps.push({ state, action: "Stand", nextState: null, reward });

  let outcome: GameOutcome = "TIE";
  if (reward === 1 || reward === 2) outcome = "WIN";
  else if (reward === -1 || reward === -2) outcome = "LOSS";

  return {
    outcome,
    steps,
    playerHand,
    dealerHand,
    playerScore,
    dealerScore,
  };
}
