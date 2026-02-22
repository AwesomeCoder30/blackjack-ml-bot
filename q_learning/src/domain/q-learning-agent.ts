import type { GameState, Action } from "../shared/api-types.js";
import { ACTIONS, stateKey, parseStateKey } from "./types.js";

export type QTable = Map<string, number>;

export interface QLearningConfig {
  learning_rate: number;
  discount_factor: number;
  epsilon: number;
  min_epsilon: number;
  epsilon_decay: number;
}

export class QLearningAgent {
  readonly config: QLearningConfig;
  epsilon: number;
  qTable: QTable = new Map();

  constructor(config: QLearningConfig) {
    this.config = config;
    this.epsilon = config.epsilon;
  }

  getQ(state: GameState, action: Action): number {
    const key = stateKey(state, action);
    return this.qTable.get(key) ?? 0;
  }

  chooseAction(state: GameState, train: boolean): Action {
    if (train && Math.random() < this.epsilon) {
      return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    }
    if (state.playerValue === 21) return "Stand";
    let best: Action = "Stand";
    let bestQ = -Infinity;
    for (const a of ACTIONS) {
      const q = this.getQ(state, a);
      if (q > bestQ) {
        bestQ = q;
        best = a;
      }
    }
    return best;
  }

  updateQValue(
    state: GameState,
    action: Action,
    reward: number,
    nextState: GameState | null
  ): void {
    let r = reward;
    if (state.playerValue === 21 && (action === "Hit" || action === "Double")) r = -10;
    if (state.playerValue === 21 && action === "Stand") r = 5;

    const maxNext = nextState
      ? Math.max(...ACTIONS.map((a) => this.getQ(nextState, a)))
      : 0;
    const key = stateKey(state, action);
    const current = this.getQ(state, action);
    const newQ =
      current +
      this.config.learning_rate * (r + this.config.discount_factor * maxNext - current);
    this.qTable.set(key, newQ);
  }

  setQTable(table: QTable): void {
    this.qTable = table;
  }

  getQTable(): QTable {
    return this.qTable;
  }
}

export function qTableFromSerialized(obj: Record<string, number>): QTable {
  const map = new Map<string, number>();
  for (const [k, v] of Object.entries(obj)) {
    try {
      parseStateKey(k);
      map.set(k, v);
    } catch {
      // skip malformed keys
    }
  }
  return map;
}

export function qTableToSerialized(table: QTable): Record<string, number> {
  const obj: Record<string, number> = {};
  for (const [k, v] of table) obj[k] = v;
  return obj;
}
