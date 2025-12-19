/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { VueWebview } from '../webviews/main'
import { ExtContext } from '../shared/extensions'

/**
 * Calculator webview for performing basic mathematical operations
 * with a fun duck theme! 🦆
 */
export class CalculatorWebview extends VueWebview {
    public static readonly sourcePath: string = 'src/webviews/components/calculator.vue'
    public readonly id = 'calculator'

    public constructor(context: ExtContext) {
        super(CalculatorWebview.sourcePath, 'calculator', context)
    }

    public static async show(context: ExtContext): Promise<CalculatorWebview> {
        const webview = new CalculatorWebview(context)
        await webview.show({
            title: '🦆 Duck Calculator',
            viewColumn: vscode.ViewColumn.Beside,
            retainContextWhenHidden: true,
        })
        return webview
    }

    protected async init(): Promise<void> {
        // Initialize the calculator webview
        // No special initialization needed for basic calculator
    }
}