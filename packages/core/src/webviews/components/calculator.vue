<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

<template>
    <div class="calculator-container">
        <h2 class="calculator-title">🦆 Duck Calculator 🧮</h2>
        <div class="calculator">
            <div class="display">
                <input 
                    type="text" 
                    v-model="display" 
                    readonly 
                    class="display-input"
                    :class="{ 'error': hasError }"
                />
            </div>
            
            <div class="buttons">
                <!-- First row -->
                <button @click="clear" class="btn btn-clear">C</button>
                <button @click="clearEntry" class="btn btn-clear">CE</button>
                <button @click="backspace" class="btn btn-operation">⌫</button>
                <button @click="inputOperation('/')" class="btn btn-operation">÷</button>
                
                <!-- Second row -->
                <button @click="inputNumber('7')" class="btn btn-number">7</button>
                <button @click="inputNumber('8')" class="btn btn-number">8</button>
                <button @click="inputNumber('9')" class="btn btn-number">9</button>
                <button @click="inputOperation('*')" class="btn btn-operation">×</button>
                
                <!-- Third row -->
                <button @click="inputNumber('4')" class="btn btn-number">4</button>
                <button @click="inputNumber('5')" class="btn btn-number">5</button>
                <button @click="inputNumber('6')" class="btn btn-number">6</button>
                <button @click="inputOperation('-')" class="btn btn-operation">−</button>
                
                <!-- Fourth row -->
                <button @click="inputNumber('1')" class="btn btn-number">1</button>
                <button @click="inputNumber('2')" class="btn btn-number">2</button>
                <button @click="inputNumber('3')" class="btn btn-number">3</button>
                <button @click="inputOperation('+')" class="btn btn-operation">+</button>
                
                <!-- Fifth row -->
                <button @click="inputNumber('0')" class="btn btn-number btn-zero">0</button>
                <button @click="inputDecimal" class="btn btn-number">.</button>
                <button @click="calculate" class="btn btn-equals">=</button>
            </div>
            
            <div class="duck-message" v-if="showDuckMessage">
                {{ duckMessage }} 🦆
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Calculator',
    data() {
        return {
            display: '0',
            previousValue: null as number | null,
            operation: null as string | null,
            waitingForOperand: false,
            hasError: false,
            showDuckMessage: false,
            duckMessage: '',
            duckMessages: [
                'Quack! Great calculation!',
                'Splish splash! Math is fun!',
                'Waddle waddle! Numbers are neat!',
                'Flap flap! You\'re doing great!',
                'Quack quack! Keep calculating!',
                'Paddle paddle! Math magic!',
                'Honk honk! Excellent work!',
                'Swim swim! Numbers rock!'
            ]
        }
    },
    methods: {
        inputNumber(num: string) {
            if (this.hasError) {
                this.clear()
            }
            
            if (this.waitingForOperand) {
                this.display = num
                this.waitingForOperand = false
            } else {
                this.display = this.display === '0' ? num : this.display + num
            }
        },
        
        inputDecimal() {
            if (this.hasError) {
                this.clear()
            }
            
            if (this.waitingForOperand) {
                this.display = '0.'
                this.waitingForOperand = false
            } else if (this.display.indexOf('.') === -1) {
                this.display += '.'
            }
        },
        
        inputOperation(nextOperation: string) {
            const inputValue = parseFloat(this.display)
            
            if (this.hasError) {
                this.clear()
                return
            }
            
            if (this.previousValue === null) {
                this.previousValue = inputValue
            } else if (this.operation) {
                const currentValue = this.previousValue || 0
                const newValue = this.performCalculation(currentValue, inputValue, this.operation)
                
                if (newValue === null) {
                    return // Error occurred
                }
                
                this.display = String(newValue)
                this.previousValue = newValue
            }
            
            this.waitingForOperand = true
            this.operation = nextOperation
        },
        
        calculate() {
            const inputValue = parseFloat(this.display)
            
            if (this.hasError) {
                this.clear()
                return
            }
            
            if (this.previousValue !== null && this.operation) {
                const newValue = this.performCalculation(this.previousValue, inputValue, this.operation)
                
                if (newValue === null) {
                    return // Error occurred
                }
                
                this.display = String(newValue)
                this.previousValue = null
                this.operation = null
                this.waitingForOperand = true
                
                // Show a fun duck message!
                this.showDuckMessage = true
                this.duckMessage = this.duckMessages[Math.floor(Math.random() * this.duckMessages.length)]
                setTimeout(() => {
                    this.showDuckMessage = false
                }, 2000)
            }
        },
        
        performCalculation(firstValue: number, secondValue: number, operation: string): number | null {
            switch (operation) {
                case '+':
                    return firstValue + secondValue
                case '-':
                    return firstValue - secondValue
                case '*':
                    return firstValue * secondValue
                case '/':
                    if (secondValue === 0) {
                        this.showError('Cannot divide by zero! 🦆💥')
                        return null
                    }
                    return firstValue / secondValue
                default:
                    return secondValue
            }
        },
        
        clear() {
            this.display = '0'
            this.previousValue = null
            this.operation = null
            this.waitingForOperand = false
            this.hasError = false
            this.showDuckMessage = false
        },
        
        clearEntry() {
            this.display = '0'
            this.hasError = false
        },
        
        backspace() {
            if (this.hasError) {
                this.clear()
                return
            }
            
            if (this.display.length > 1) {
                this.display = this.display.slice(0, -1)
            } else {
                this.display = '0'
            }
        },
        
        showError(message: string) {
            this.display = 'Error'
            this.hasError = true
            this.duckMessage = message
            this.showDuckMessage = true
            setTimeout(() => {
                this.showDuckMessage = false
            }, 3000)
        }
    }
})
</script>

<style scoped>
.calculator-container {
    padding: 20px;
    max-width: 400px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.calculator-title {
    text-align: center;
    color: var(--vscode-foreground);
    margin-bottom: 20px;
    font-size: 24px;
}

.calculator {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.display {
    margin-bottom: 20px;
}

.display-input {
    width: 100%;
    height: 60px;
    font-size: 24px;
    text-align: right;
    padding: 0 15px;
    border: 2px solid var(--vscode-input-border);
    border-radius: 8px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    box-sizing: border-box;
}

.display-input.error {
    border-color: var(--vscode-errorForeground);
    color: var(--vscode-errorForeground);
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.btn {
    height: 50px;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:active {
    transform: translateY(0);
}

.btn-number {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: 1px solid var(--vscode-button-border);
}

.btn-number:hover {
    background: var(--vscode-button-secondaryHoverBackground);
}

.btn-operation {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
}

.btn-operation:hover {
    background: var(--vscode-button-hoverBackground);
}

.btn-clear {
    background: var(--vscode-errorForeground);
    color: white;
}

.btn-clear:hover {
    opacity: 0.9;
}

.btn-equals {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    grid-column: span 1;
}

.btn-equals:hover {
    background: var(--vscode-button-hoverBackground);
}

.btn-zero {
    grid-column: span 2;
}

.duck-message {
    margin-top: 15px;
    padding: 10px;
    background: var(--vscode-notifications-background);
    border: 1px solid var(--vscode-notifications-border);
    border-radius: 8px;
    text-align: center;
    color: var(--vscode-notifications-foreground);
    font-weight: 500;
    animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(10px); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
}
</style>