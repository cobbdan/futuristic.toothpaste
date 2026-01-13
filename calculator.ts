export class Calculator {
    add(a: number, b: number): number {
        return a + b;
    }

    subtract(a: number, b: number): number {
        return a - b;
    }

    multiply(a: number, b: number): number {
        return a * b;
    }

    divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error("Quack! 🦆 Can't divide by zero!");
        }
        return a / b;
    }

    calculate(operation: string, a: number, b: number): number {
        switch (operation) {
            case 'add': return this.add(a, b);
            case 'subtract': return this.subtract(a, b);
            case 'multiply': return this.multiply(a, b);
            case 'divide': return this.divide(a, b);
            default:
                throw new Error("Quack-quack! 🦆 Unknown operation!");
        }
    }
}
