/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Basic calculator operations for mathematical computations.
 * 
 * This utility provides fundamental arithmetic operations with proper error handling
 * and type safety. Perfect for when you need to crunch some numbers! 🦆🧮
 */

/**
 * Supported calculator operations
 */
export type CalculatorOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt'

/**
 * Result of a calculator operation
 */
export interface CalculatorResult {
    result: number
    operation: string
    success: boolean
    error?: string
}

/**
 * A basic calculator that performs arithmetic operations.
 * 
 * #### Example
 * ```ts
 * const result = calculator(10, 5, 'add')
 * console.log(result.result) // 15
 * 
 * const divisionResult = calculator(10, 0, 'divide')
 * console.log(divisionResult.error) // "Division by zero is not allowed"
 * ```
 * 
 * @param a First number (operand)
 * @param b Second number (operand) - optional for some operations like sqrt
 * @param operation The operation to perform
 * @returns CalculatorResult with the result and operation details
 */
export function calculator(a: number, b: number, operation: CalculatorOperation): CalculatorResult
export function calculator(a: number, operation: 'sqrt'): CalculatorResult
export function calculator(a: number, bOrOperation: number | 'sqrt', operation?: CalculatorOperation): CalculatorResult {
    // Handle sqrt overload
    if (typeof bOrOperation === 'string' && bOrOperation === 'sqrt') {
        return performSqrt(a)
    }
    
    const b = bOrOperation as number
    const op = operation!
    
    // Validate inputs
    if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) {
        return {
            result: NaN,
            operation: `${a} ${op} ${b}`,
            success: false,
            error: 'Invalid input: Both operands must be valid numbers'
        }
    }
    
    switch (op) {
        case 'add':
            return performOperation(a, b, op, a + b)
        
        case 'subtract':
            return performOperation(a, b, op, a - b)
        
        case 'multiply':
            return performOperation(a, b, op, a * b)
        
        case 'divide':
            if (b === 0) {
                return {
                    result: NaN,
                    operation: `${a} ÷ ${b}`,
                    success: false,
                    error: 'Division by zero is not allowed'
                }
            }
            return performOperation(a, b, op, a / b)
        
        case 'power':
            return performOperation(a, b, op, Math.pow(a, b))
        
        default:
            return {
                result: NaN,
                operation: `${a} ${op} ${b}`,
                success: false,
                error: `Unsupported operation: ${op}`
            }
    }
}

/**
 * Performs square root operation on a single number
 */
function performSqrt(a: number): CalculatorResult {
    if (typeof a !== 'number' || isNaN(a)) {
        return {
            result: NaN,
            operation: `√${a}`,
            success: false,
            error: 'Invalid input: Operand must be a valid number'
        }
    }
    
    if (a < 0) {
        return {
            result: NaN,
            operation: `√${a}`,
            success: false,
            error: 'Cannot calculate square root of negative number'
        }
    }
    
    return {
        result: Math.sqrt(a),
        operation: `√${a}`,
        success: true
    }
}

/**
 * Helper function to create a successful operation result
 */
function performOperation(a: number, b: number, operation: string, result: number): CalculatorResult {
    const operationSymbol = getOperationSymbol(operation)
    return {
        result,
        operation: `${a} ${operationSymbol} ${b}`,
        success: true
    }
}

/**
 * Gets the mathematical symbol for an operation
 */
function getOperationSymbol(operation: string): string {
    switch (operation) {
        case 'add': return '+'
        case 'subtract': return '-'
        case 'multiply': return '×'
        case 'divide': return '÷'
        case 'power': return '^'
        default: return operation
    }
}

/**
 * Convenience functions for common operations
 */

/**
 * Adds two numbers together
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
    return calculator(a, b, 'add').result
}

/**
 * Subtracts second number from first number
 * @param a First number (minuend)
 * @param b Second number (subtrahend)
 * @returns Difference of a and b
 */
export function subtract(a: number, b: number): number {
    return calculator(a, b, 'subtract').result
}

/**
 * Multiplies two numbers
 * @param a First number
 * @param b Second number
 * @returns Product of a and b
 */
export function multiply(a: number, b: number): number {
    return calculator(a, b, 'multiply').result
}

/**
 * Divides first number by second number
 * @param a Dividend
 * @param b Divisor
 * @returns Quotient of a and b, or NaN if b is zero
 */
export function divide(a: number, b: number): number {
    return calculator(a, b, 'divide').result
}

/**
 * Raises first number to the power of second number
 * @param a Base
 * @param b Exponent
 * @returns a raised to the power of b
 */
export function power(a: number, b: number): number {
    return calculator(a, b, 'power').result
}

/**
 * Calculates square root of a number
 * @param a Number to find square root of
 * @returns Square root of a, or NaN if a is negative
 */
export function sqrt(a: number): number {
    return calculator(a, 'sqrt').result
}