export type Action = "Hit" | "Stand" | "Double";
export type GameOutcome = "WIN" | "LOSS" | "TIE";

export interface GameState {
  playerValue: number;
  dealerCardValue: number;
  soft: boolean;
  numCards: number;
  firstTurn: boolean;
}

export interface Config {
  learning_rate: number;
  discount_factor: number;
  epsilon_start: number;
  epsilon_decay: number;
  min_epsilon: number;
  training_episodes: number;
  evaluation_games: number;
}

export interface PlayRequest {
  player_hand: string[];
  dealer_card: string;
}

export interface PlayResponse {
  action: Action;
  confidence: number;
  basicStrategy?: "Hit" | "Stand" | "Double" | "Split";
}

export interface TrainRequest {
  episodes?: number;
}

export interface TrainResponse {
  message: string;
}

export interface SimulateStep {
  player_hand: string[];
  dealer_card: string;
  action: Action | null;
}

export interface SimulateResponse {
  log: SimulateStep[];
  final_player_hand: string[];
  final_dealer_hand: string[];
  player_score: number;
  dealer_score: number;
  outcome: GameOutcome;
}

export interface EvaluateResponse {
  WIN: number;
  LOSS: number;
  TIE: number;
}

export interface AboutResponse {
  title: string;
  description: string;
  motivation: string;
  features: string[];
}

export interface TrainingProgressPoint {
  episode: number;
  winRate: number;
}
