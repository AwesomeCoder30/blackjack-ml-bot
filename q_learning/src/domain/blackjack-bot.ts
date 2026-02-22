import type { Config } from "../shared/api-types.js";
import type { GameState, Action, GameOutcome } from "../shared/api-types.js";
import { CARD_VALUES } from "./types.js";
import { handValue } from "./hand.js";
import { Deck } from "./deck.js";
import { playOneRound } from "./blackjack-game.js";
import { QLearningAgent, qTableFromSerialized, type QTable } from "./q-learning-agent.js";

export interface QTableStore {
  load(): Promise<QTable>;
  save(table: QTable): Promise<void>;
}

export interface ResultsStore {
  append(episode: number, wins: number, losses: number, ties: number): Promise<void>;
}

export class BlackjackBot {
  private readonly deck = new Deck();
  private readonly agent: QLearningAgent;
  private readonly qStore: QTableStore;
  private readonly resultsStore: ResultsStore;
  private resultsBuffer = { wins: 0, losses: 0, ties: 0 };

  constructor(
    config: Config,
    qStore: QTableStore,
    resultsStore: ResultsStore
  ) {
    this.agent = new QLearningAgent({
      learning_rate: config.learning_rate,
      discount_factor: config.discount_factor,
      epsilon: config.epsilon_start,
      min_epsilon: config.min_epsilon,
      epsilon_decay: config.epsilon_decay,
    });
    this.qStore = qStore;
    this.resultsStore = resultsStore;
  }

  async loadQTable(): Promise<void> {
    const table = await this.qStore.load();
    this.agent.setQTable(table);
  }

  async saveQTable(): Promise<void> {
    await this.qStore.save(this.agent.getQTable());
  }

  deckDeal(): string {
    return this.deck.deal();
  }

  handValue(hand: string[]): { total: number; soft: boolean } {
    const r = handValue(hand);
    return { total: r.total, soft: r.soft };
  }

  getEpsilon(): number {
    return this.agent.epsilon;
  }

  setEpsilon(e: number): void {
    this.agent.epsilon = e;
  }

  toState(playerHand: string[], dealerCard: string): GameState {
    const { total, soft } = this.handValue(playerHand);
    const dealerCardValue = CARD_VALUES[dealerCard] ?? 0;
    return {
      playerValue: total,
      dealerCardValue,
      soft,
      numCards: playerHand.length,
      firstTurn: true,
    };
  }

  chooseAction(state: GameState, train: boolean): Action {
    return this.agent.chooseAction(state, train);
  }

  getQ(state: GameState, action: Action): number {
    return this.agent.getQ(state, action);
  }

  playHand(train: boolean): GameOutcome {
    const choose = (state: GameState) => this.agent.chooseAction(state, train);
    const result = playOneRound(this.deck, choose);

    if (train) {
      for (const step of result.steps) {
        this.agent.updateQValue(
          step.state,
          step.action,
          step.reward,
          step.nextState
        );
      }
    }

    return result.outcome;
  }

  async train(episodes: number): Promise<void> {
    await this.loadQTable();
    const decay = 0.999;

    for (let i = 0; i < episodes; i++) {
      const outcome = this.playHand(true);
      if (outcome === "WIN") this.resultsBuffer.wins++;
      else if (outcome === "LOSS") this.resultsBuffer.losses++;
      else this.resultsBuffer.ties++;

      this.agent.epsilon = Math.max(
        this.agent.config.min_epsilon,
        this.agent.epsilon * decay
      );

      if (i > 0 && i % 10000 === 0) {
        await this.resultsStore.append(
          i,
          this.resultsBuffer.wins,
          this.resultsBuffer.losses,
          this.resultsBuffer.ties
        );
        this.resultsBuffer = { wins: 0, losses: 0, ties: 0 };
      }
      if (i > 0 && i % 50000 === 0) await this.saveQTable();
    }

    await this.resultsStore.append(
      episodes,
      this.resultsBuffer.wins,
      this.resultsBuffer.losses,
      this.resultsBuffer.ties
    );
    await this.saveQTable();
  }

  evaluate(numGames: number): { WIN: number; LOSS: number; TIE: number } {
    const results = { WIN: 0, LOSS: 0, TIE: 0 };
    for (let i = 0; i < numGames; i++) {
      const outcome = this.playHand(false);
      results[outcome]++;
    }
    return results;
  }

  runSimulation(): {
    log: Array<{ player_hand: string[]; dealer_card: string; action: Action | null }>;
    final_player_hand: string[];
    final_dealer_hand: string[];
    player_score: number;
    dealer_score: number;
    outcome: GameOutcome;
  } {
    const playerHand: string[] = [this.deck.deal(), this.deck.deal()];
    const dealerCard = this.deck.deal();
    const dealerHand = [dealerCard, this.deck.deal()];
    const log: Array<{ player_hand: string[]; dealer_card: string; action: Action | null }> = [];

    let state = this.toState(playerHand, dealerCard);
    log.push({ player_hand: [...playerHand], dealer_card: dealerCard, action: null });

    while (true) {
      const action = this.agent.chooseAction(state, false);
      log[log.length - 1].action = action;

      if (action === "Hit") {
        playerHand.push(this.deck.deal());
        state = this.toState(playerHand, dealerCard);
        log.push({ player_hand: [...playerHand], dealer_card: dealerCard, action: null });
        if (state.playerValue > 21) break;
      } else if (action === "Double" && playerHand.length === 2) {
        playerHand.push(this.deck.deal());
        break;
      } else {
        break;
      }
    }

    let dealerScore = this.handValue(dealerHand).total;
    while (dealerScore < 17) {
      dealerHand.push(this.deck.deal());
      dealerScore = this.handValue(dealerHand).total;
    }

    const playerScore = this.handValue(playerHand).total;
    let outcome: GameOutcome = "TIE";
    if (playerScore > 21) outcome = "LOSS";
    else if (dealerScore > 21 || playerScore > dealerScore) outcome = "WIN";
    else if (playerScore < dealerScore) outcome = "LOSS";

    return {
      log,
      final_player_hand: playerHand,
      final_dealer_hand: dealerHand,
      player_score: playerScore,
      dealer_score: dealerScore,
      outcome,
    };
  }

  getQTable(): QTable {
    return this.agent.getQTable();
  }

  loadQTableFromData(data: Record<string, number>): void {
    this.agent.setQTable(qTableFromSerialized(data));
  }
}
