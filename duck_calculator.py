def quack_ulator(num1, num2, operation):
    """
    A basic calculator function that performs arithmetic operations.
    
    :param num1: First number
    :param num2: Second number
    :param operation: String representing the operation ('+', '-', '*', '/')
    :return: Result of the operation
    """
    if operation == '+':
        return num1 + num2
    elif operation == '-':
        return num1 - num2
    elif operation == '*':
        return num1 * num2
    elif operation == '/':
        if num2 != 0:
            return num1 / num2
        else:
            return "Quack! Cannot divide by zero!"
    else:
        return "Quack! Invalid operation!"
