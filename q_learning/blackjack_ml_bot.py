import json
import random
import matplotlib.pyplot as plt # type: ignore
import pandas as pd # type: ignore
import os

class BlackjackBot:
    def __init__(self, config_file="config.json", results_file="blackjack_results.csv", q_table_file="q_table.json"):
        """Initializes the Blackjack bot and loads config settings."""
        with open(config_file, "r") as f:
            config = json.load(f)

        self.learning_rate = config["learning_rate"]
        self.discount_factor = config["discount_factor"]
        self.epsilon = config["epsilon_start"]
        self.epsilon_decay = config["epsilon_decay"]
        self.min_epsilon = config["min_epsilon"]
        self.training_episodes = config["training_episodes"]
        self.evaluation_games = config["evaluation_games"]
        self.results_file = results_file
        self.q_table_file = q_table_file

        self.card_values = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
        }

        self.deck = []
        self.q_table = self.load_q_table()  # Load existing Q-table
        self.training_progress = []
        self.shuffle_deck()
        self.results_buffer = {"Wins": 0, "Losses": 0, "Ties": 0}  # Store results in memory

    def load_q_table(self):
        """Loads the Q-table from a file if it exists."""
        if os.path.exists(self.q_table_file):
            with open(self.q_table_file, "r") as f:
                try:
                    data = json.load(f)
                    return {eval(k): v for k, v in data.items()}
                except json.JSONDecodeError:
                    print("Error loading Q-table. Starting fresh.")
                    return {}
        return {}

    
    def save_q_table(self):
        """Saves the Q-table to a file after training."""
        with open(self.q_table_file, "w") as f:
            json.dump({str(k): v for k, v in self.q_table.items()}, f)

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
        current_q = self.q_table.get((state, action), 0)
        self.q_table[(state, action)] = current_q + self.learning_rate * (reward + self.discount_factor * max_future_q - current_q)

    def play_hand(self, train=True):
        """Plays a round of Blackjack, with an improved state representation and better Q-learning updates."""
        player_hand = [self.deal_card(), self.deal_card()]
        dealer_card = self.deal_card()
        player_value, soft = self.hand_value(player_hand)
        state = (player_value, self.card_values[dealer_card], soft, len(player_hand), True)  # Adding "can_double"

        while True:
            action = self.choose_action(state)

            if action == "hit":
                player_hand.append(self.deal_card())
                player_value, soft = self.hand_value(player_hand)
                next_state = (player_value, self.card_values[dealer_card], soft, len(player_hand), False)  # No double after hit
                if player_value > 21:
                    if train:
                        self.update_q_value(state, action, -1, next_state)
                    return "LOSS"
                if train:
                    self.update_q_value(state, action, 0, next_state)
                state = next_state

            elif action == "double" and len(player_hand) == 2:  # Only allowed if first move
                player_hand.append(self.deal_card())
                player_value, soft = self.hand_value(player_hand)
                next_state = (player_value, self.card_values[dealer_card], soft, len(player_hand), False)
                reward = 2 if player_value <= 21 else -2  # Adjusted reward
                if train:
                    self.update_q_value(state, action, reward, next_state)
                return "WIN" if reward > 0 else "LOSS"

            else:  # Stand
                break

        # Dealer plays
        dealer_hand = [dealer_card, self.deal_card()]
        while self.hand_value(dealer_hand)[0] < 17:
            dealer_hand.append(self.deal_card())

        player_score, _ = self.hand_value(player_hand)
        dealer_score, _ = self.hand_value(dealer_hand)

        if player_score > 21:
            reward = -1
        elif dealer_score > 21 or player_score > dealer_score:
            reward = 1
        elif player_score < dealer_score:
            reward = -1
        else:
            reward = 0

        if train:
            self.update_q_value(state, "stand", reward, None)

        return "WIN" if reward == 1 else "LOSS" if reward == -1 else "TIE"



    def train(self, episodes):
        """Trains the bot by playing multiple games, using a better Q-learning update process."""
        self.q_table = self.load_q_table()  # Load existing Q-table at start
        for i in range(episodes):
            result = self.play_hand(train=True)
            self.log_result(result, i)
            self.epsilon = max(self.min_epsilon, self.epsilon * 0.999)  # Slower decay
            if i % 10000 == 0:
                print(f"Training progress: {i} games completed.")
            if i % 50000 == 0:  # Save Q-table every 50k episodes
                self.save_q_table()
        self.save_q_table()
        print("Training completed.")


    def evaluate(self, num_games):
        """Evaluates the bot's performance after training."""
        results = {"WIN": 0, "LOSS": 0, "TIE": 0}
        for _ in range(num_games):
            result = self.play_hand(train=False)
            if result in results:
                results[result]+=1
        return results
    
    def log_result(self, result, episode):
        """Stores results in memory and writes to file every 10,000 episodes."""
        if result == "WIN":
            self.results_buffer["Wins"] += 1
        elif result == "LOSS":
            self.results_buffer["Losses"] += 1
        else:
            self.results_buffer["Ties"] += 1

        # Only write to file every 10,000 episodes
        if episode % 10000 == 0:
            self.write_results_to_csv(episode)

    def write_results_to_csv(self, episode):
        """Writes the aggregated results to the CSV file in a structured way."""
        new_entry = {
            "Episode": episode,
            "Wins": self.results_buffer["Wins"],
            "Losses": self.results_buffer["Losses"],
            "Ties": self.results_buffer["Ties"]
        }

        df = pd.DataFrame([new_entry])
        df.to_csv(self.results_file, mode='a', header=not os.path.exists(self.results_file), index=False)

        # Reset in-memory buffer
        self.results_buffer = {"Wins": 0, "Losses": 0, "Ties": 0}


    def load_results(self):
        """Loads past results and updates win rate tracking."""
        if os.path.exists(self.results_file):
            df = pd.read_csv(self.results_file)
            if not df.empty and all(col in df.columns for col in ["Wins", "Losses", "Ties"]):
                total_games = df["Wins"].sum() + df["Losses"].sum() + df["Ties"].sum()
                win_rate = df["Wins"].sum() / total_games if total_games > 0 else 0
                self.training_progress.append(win_rate)

    def plot_training_progress(self):
        """Plots the bot's rolling win rate over training iterations for better trend visualization."""
        if not os.path.exists(self.results_file):
            print("No training data available to plot.")
            return

        df = pd.read_csv(self.results_file)
        if df.empty or "Episode" not in df.columns:
            print("No recorded results to plot.")
            return

        # Compute win rate and rolling average
        df["Win Rate"] = df["Wins"] / (df["Wins"] + df["Losses"] + df["Ties"])
        df["Rolling Win Rate"] = df["Win Rate"].rolling(10, min_periods=1).mean()  # Rolling avg over 10 entries

        # Plot raw win rate and rolling average
        plt.figure(figsize=(8, 5))
        plt.plot(df["Episode"], df["Win Rate"], marker='o', linestyle='-', color='gray', alpha=0.5, label="Raw Win Rate")
        plt.plot(df["Episode"], df["Rolling Win Rate"], marker='o', linestyle='-', color='blue', label="Rolling Win Rate (10 avg)")

        plt.xlabel("Training Episode")
        plt.ylabel("Win Rate")
        plt.title("Blackjack Bot Learning Progress")
        plt.legend()
        plt.grid(True)

        plt.show(block=False)  # Allows script to continue running
        plt.pause(3)  # Keeps plot open for 3 seconds before closing automatically
        plt.close()  # Prevents excessive memory usage



# Train and evaluate bot
bot = BlackjackBot()
bot.train(250000)
print("Evaluation Results:", bot.evaluate(100))
bot.plot_training_progress()
