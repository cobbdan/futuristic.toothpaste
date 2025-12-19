# 🦆 Quack-culator: The most fun-tastic calculator in the pond! 🎉🧮

def ducky_calculator(quack_eration, duck_number1, duck_number2):
    """
    A quack-tastic calculator that does basic duck math! 🦆➕➖✖️➗
    
    Args:
        quack_eration (str): The operation to perform (add, subtract, multiply, divide)
        duck_number1 (float): The first number (or how many ducks?)
        duck_number2 (float): The second number (or how many more ducks?)
    
    Returns:
        float: The result of the duck math!
    """
    if quack_eration == "add":
        return duck_number1 + duck_number2  # Quack quack! More ducks! 🦆🦆
    elif quack_eration == "subtract":
        return duck_number1 - duck_number2  # Oh no, some ducks flew away! 🦆💨
    elif quack_eration == "multiply":
        return duck_number1 * duck_number2  # A duck family reunion! 🦆👨‍👩‍👧‍👦
    elif quack_eration == "divide":
        if duck_number2 == 0:
            return "Quack-astrophe! Can't divide by zero ducks! 🙅‍♂️🦆"
        return duck_number1 / duck_number2  # Sharing bread among ducks! 🍞➗🦆
    else:
        return "Quack-cuse me? That's not a valid operation! 🦆❓"

# Example usage:
print(ducky_calculator("add", 5, 3))  # Should print: 8 (5 ducks + 3 ducks = 8 happy ducks! 🦆🎉)

