import json

# Load Q-table
q_table_file = "q_table.json"

with open(q_table_file, "r") as f:
    q_table = json.load(f)

# Define hand and dealer card
player_hand = ["10", "A"]
dealer_card = "5"

# Convert the hand into state format
card_values = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11}
player_value = sum(card_values[card] for card in player_hand)
soft = "A" in player_hand
state = (player_value, card_values[dealer_card], soft, len(player_hand), True)

# Get Q-values
actions = ["hit", "stand", "double"]
q_values = {action: q_table.get(str((state, action)), 0) for action in actions}

# Print results
print(f"State: {state}")
for action, value in q_values.items():
    print(f"Action: {action}, Q-value: {value}")
