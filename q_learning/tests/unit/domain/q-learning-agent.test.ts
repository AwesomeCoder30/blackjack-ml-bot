import { describe, it, expect } from "vitest";
import { QLearningAgent } from "../../../src/domain/q-learning-agent.js";

describe("QLearningAgent", () => {
  const config = {
    learning_rate: 0.1,
    discount_factor: 0.95,
    epsilon: 0,
    min_epsilon: 0,
    epsilon_decay: 0.99,
  };

  it("chooseAction with epsilon 0 picks max Q action", () => {
    const agent = new QLearningAgent(config);
    const state = { playerValue: 18, dealerCardValue: 10, soft: false, numCards: 2, firstTurn: true };
    agent.updateQValue(state, "Stand", 1, null);
    agent.updateQValue(state, "Hit", -0.5, null);
    expect(agent.chooseAction(state, false)).toBe("Stand");
  });

  it("chooseAction returns stand at 21", () => {
    const agent = new QLearningAgent(config);
    const state = { playerValue: 21, dealerCardValue: 7, soft: true, numCards: 2, firstTurn: true };
    expect(agent.chooseAction(state, false)).toBe("Stand");
  });

  it("updateQValue changes Q for state-action", () => {
    const agent = new QLearningAgent(config);
    const state = { playerValue: 17, dealerCardValue: 6, soft: false, numCards: 2, firstTurn: true };
    expect(agent.getQ(state, "Stand")).toBe(0);
    agent.updateQValue(state, "Stand", 1, null);
    expect(agent.getQ(state, "Stand")).not.toBe(0);
  });
});
