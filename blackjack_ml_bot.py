import random
import matplotlib.pyplot as plt # type: ignore

class BlackjackBot:
    def __init__(self):
        """Initializes the Blackjack bot with enhanced Q-learning capabilities."""
        self.card_values = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11}
        self.deck = []
        self.q_table = {}
        self.learning_rate = 0.05
        self.discount_factor = 0.95
        self.epsilon = 1.0
        self.epsilon_decay = 0.9995
        self.min_epsilon = 0.01
        self.training_progress = []
        self.shuffle_deck()

    def shuffle_deck(self):
        """Shuffles the deck."""
        self.deck = list(self.card_values.keys()) * 4
        random.shuffle(self.deck)

    def deal_card(self):
        """Deals a card and reshuffles if needed."""
        if not self.deck:
            self.shuffle_deck()
        return self.deck.pop()

    def hand_value(self, hand):
        """Calculates the hand's total value, considering Aces as 1 or 11."""
        value = sum(self.card_values[card] for card in hand)
        aces = hand.count('A')
        soft = aces > 0
        while value > 21 and aces:
            value -= 10
            aces -= 1
        return value, soft

    def choose_action(self, state):
        """Chooses an action using an epsilon-greedy strategy."""
        if random.uniform(0, 1) < self.epsilon:
            return random.choice(["hit", "stand", "double"])
        return max(["hit", "stand", "double"], key=lambda a: self.q_table.get((state, a), 0))

    def update_q_value(self, state, action, reward, next_state):
        """Updates the Q-value for the given state-action pair."""
        max_future_q = max(self.q_table.get((next_state, a), 0) for a in ["hit", "stand", "double"])
        self.q_table[(state, action)] = self.q_table.get((state, action), 0) + self.learning_rate * (reward + self.discount_factor * max_future_q - self.q_table.get((state, action), 0))

    def play_hand(self, train=True):
        """Plays a round of Blackjack with learning enabled."""
        player_hand = [self.deal_card(), self.deal_card()]
        dealer_card = self.deal_card()
        player_value, soft = self.hand_value(player_hand)
        state = (player_value, self.card_values[dealer_card], soft, len(player_hand))

        while True:
            action = self.choose_action(state)
            if action == "hit":
                player_hand.append(self.deal_card())
                player_value, soft = self.hand_value(player_hand)
                next_state = (player_value, self.card_values[dealer_card], soft, len(player_hand))
                if player_value > 21:
                    if train:
                        self.update_q_value(state, action, -1, next_state)
                    return "LOSS"
                if train:
                    self.update_q_value(state, action, 0, next_state)
                state = next_state
            elif action == "double" and len(player_hand) == 2:
                player_hand.append(self.deal_card())
                player_value, soft = self.hand_value(player_hand)
                next_state = (player_value, self.card_values[dealer_card], soft, len(player_hand))
                reward = 2 if player_value <= 21 else -2
                if train:
                    self.update_q_value(state, action, reward, next_state)
                return "WIN" if reward > 0 else "LOSS"
            else:
                break

        dealer_hand = [dealer_card, self.deal_card()]
        while self.hand_value(dealer_hand)[0] < 17:
            dealer_hand.append(self.deal_card())

        player_score, _ = self.hand_value(player_hand)
        dealer_score, _ = self.hand_value(dealer_hand)
        reward = 1 if player_score > dealer_score or dealer_score > 21 else -1 if player_score < dealer_score else 0
        if train:
            self.update_q_value(state, "stand", reward, None)

        return "WIN" if reward == 1 else "LOSS" if reward == -1 else "TIE"

    def train(self, episodes=250000):
        """Trains the bot by playing multiple games."""
        for i in range(episodes):
            result = self.play_hand(train=True)
            self.epsilon = max(self.min_epsilon, self.epsilon * (0.999 if i < 125000 else 0.9999))
            if i % 1000 == 0:
                evaluation = self.evaluate(100)
                win_rate = evaluation["WIN"] / 100.0
                self.training_progress.append(win_rate)
        print("Training completed.")

    def evaluate(self, num_games=100):
        """Evaluates the bot's performance after training."""
        results = {"WIN": 0, "LOSS": 0, "TIE": 0}
        for _ in range(num_games):
            result = self.play_hand(train=False)
            if result in results:
                results[result] += 1
        return results

    def plot_training_progress(self):
        """Plots the bot's win rate over training iterations."""
        if not self.training_progress:
            print("No training data available to plot.")
            return
        plt.figure(figsize=(8,5))
        plt.plot(range(0, len(self.training_progress) * 1000, 1000), self.training_progress, marker='o', linestyle='-')
        plt.xlabel("Training Iteration")
        plt.ylabel("Win Rate")
        plt.title("Blackjack Bot Learning Progress")
        plt.grid(True)
        plt.show()

# Train and evaluate bot
bot = BlackjackBot()
bot.train(250000)
print("Evaluation Results:", bot.evaluate(100))
bot.plot_training_progress()
