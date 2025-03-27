from flask import Flask, render_template, request, jsonify # type: ignore
from blackjack_ml_bot import BlackjackBot
import requests # type: ignore
import json
import os

app = Flask(__name__)
bot = BlackjackBot()
os.makedirs("saved_models", exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/play", methods=["POST"])
def play():
    """Receives player's hand and dealer card, returns bot's action."""
    try:
        data = request.get_json()
        print("Received data:", data)
        if not data:
            return jsonify({"error": "Invalid or empty JSON payload"}), 400
        player_hand = [card.strip() for card in data["player_hand"]]
        dealer_card = data["dealer_card"]

        player_value, soft = bot.hand_value(player_hand)
        state = (player_value, bot.card_values[dealer_card], soft, len(player_hand), True)

        bot.epsilon = 0
        action = bot.choose_action(state, train=False)

        print("Bot action:", action)
        return jsonify({"action": action})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 400

@app.route("/train", methods=["POST"])
def train():
    """Trains the bot with specified episodes."""
    try:
        data = request.get_json()
        episodes = data.get("episodes", 50000)  # Default: 50,000 episodes
        bot.train(episodes)
        return jsonify({"message": f"Training completed for {episodes} episodes."})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/evaluate", methods=["GET"])
def evaluate():
    """Evaluates the bot's performance."""
    results = bot.evaluate(100)
    return jsonify(results)

@app.route("/simulate", methods=["POST"])
def simulate():
    """Simulates a full Blackjack game and returns the step-by-step play."""
    try:
        simulation_log = []
        player_hand = [bot.deal_card(), bot.deal_card()]
        dealer_card = bot.deal_card()
        dealer_hand = [dealer_card, bot.deal_card()]

        player_value, soft = bot.hand_value(player_hand)
        state = (player_value, bot.card_values[dealer_card], soft, len(player_hand), True)

        simulation_log.append({
            "player_hand": player_hand.copy(),
            "dealer_card": dealer_card,
            "action": None,
            "state": state
        })

        while True:
            action = bot.choose_action(state)
            simulation_log[-1]["action"] = action

            if action == "hit":
                player_hand.append(bot.deal_card())
                player_value, soft = bot.hand_value(player_hand)
                next_state = (player_value, bot.card_values[dealer_card], soft, len(player_hand), False)
                state = next_state
                simulation_log.append({
                    "player_hand": player_hand.copy(),
                    "dealer_card": dealer_card,
                    "action": None,
                    "state": state
                })
                if player_value > 21:
                    break

            elif action == "double" and len(player_hand) == 2:
                player_hand.append(bot.deal_card())
                break

            else:  # stand
                break

        # Dealer logic
        dealer_score, _ = bot.hand_value(dealer_hand)
        while dealer_score < 17:
            dealer_hand.append(bot.deal_card())
            dealer_score, _ = bot.hand_value(dealer_hand)

        player_score, _ = bot.hand_value(player_hand)
        outcome = "TIE"
        if player_score > 21:
            outcome = "LOSS"
        elif dealer_score > 21 or player_score > dealer_score:
            outcome = "WIN"
        elif player_score < dealer_score:
            outcome = "LOSS"

        return jsonify({
            "log": simulation_log,
            "final_player_hand": player_hand,
            "final_dealer_hand": dealer_hand,
            "player_score": player_score,
            "dealer_score": dealer_score,
            "outcome": outcome
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/save", methods=["POST"])
def save_bot():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"error": "Name required"}), 400

    q_table_file = f"saved_models/q_table_{name}.json"
    with open(q_table_file, "w") as f:
        json.dump({str(k): v for k, v in bot.q_table.items()}, f)
    return jsonify({"message": f"Bot saved as '{name}'."})

@app.route("/load", methods=["POST"])
def load_bot():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"error": "Name required"}), 400

    q_table_file = f"saved_models/q_table_{name}.json"
    if not os.path.exists(q_table_file):
        return jsonify({"error": "Model not found"}), 404

    with open(q_table_file, "r") as f:
        bot.q_table = {eval(k): v for k, v in json.load(f).items()}
    return jsonify({"message": f"Bot '{name}' loaded successfully."})

@app.route("/models", methods=["GET"])
def list_models():
    files = os.listdir("saved_models")
    models = [f.replace("q_table_", "").replace(".json", "") for f in files if f.endswith(".json")]
    return jsonify(models)

if __name__ == "__main__":
    app.run(debug=True, port=5001)