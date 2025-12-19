def calculator(operation, a, b):
    """
    A basic calculator function that performs arithmetic operations.
    
    :param operation: String representing the operation ('add', 'subtract', 'multiply', 'divide')
    :param a: First number
    :param b: Second number
    :return: Result of the operation
    """
    if operation == 'add':
        return a + b
    elif operation == 'subtract':
        return a - b
    elif operation == 'multiply':
        return a * b
    elif operation == 'divide':
        if b != 0:
            return a / b
        else:
            return "Error: Division by zero!"
    else:
        return "Error: Invalid operation!"
