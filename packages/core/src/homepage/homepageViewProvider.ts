/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { BaseTemplates } from '../shared/templates/baseTemplates'

/**
 * Provides an example integration for the Strands Agents homepage
 * following the existing webview patterns in the codebase.
 */
export class HomepageViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'strandsAgents.homepage'

    private view?: vscode.WebviewView

    constructor(private readonly extensionContext: vscode.ExtensionContext) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ): void | Promise<void> {
        this.view = webviewView

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionContext.extensionUri, 'packages', 'core', 'resources'),
                vscode.Uri.joinPath(this.extensionContext.extensionUri, 'packages', 'core', 'src', 'homepage'),
            ],
        }

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview)

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'openUserGuide':
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://docs.strands-agents.com'))
                    break
            }
        })
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        // Get the CSS URI for the homepage styles
        const homepageCssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionContext.extensionUri,
                'packages',
                'core',
                'resources',
                'css',
                'homepage.css'
            )
        )

        // Use the base template pattern from the existing codebase
        const content = `
            <header class="navbar-container">
                <div class="navbar-frame">
                    <nav class="navbar-primary">
                        <div class="navbar-left">
                            <div class="logo-header">
                                <div class="logo-wordmark">
                                    <div class="logo-icon">
                                        <svg width="36" height="58" viewBox="0 0 36 58" fill="none">
                                            <path d="M0 6.52H36.45V45.33H0V6.52Z" fill="#0E0E0E"/>
                                            <path d="M0 0H36.34V58.21H0V0Z" fill="url(#gradient)"/>
                                            <defs>
                                                <linearGradient id="gradient">
                                                    <stop offset="0%" stop-color="rgba(0,0,0,0.2)"/>
                                                    <stop offset="100%" stop-color="#00FF77"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <div class="logo-text">
                                        <h1 class="logo-title">STRANDS<br>AGENTS</h1>
                                        <div class="logo-sdk-badge">
                                            <span>SDK</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="version-dropdown">
                                <span class="version-text">0.0.x</span>
                                <svg class="chevron-icon" width="20" height="20" viewBox="0 0 20 20">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#555555" stroke-width="1.25" fill="none"/>
                                </svg>
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            <main class="main-content">
                <section class="hero-section">
                    <div class="hero-content">
                        <h1 class="hero-title">
                            AI Agents That Plan,<br>
                            Think & Orchestrate from<br>
                            Prototype to Production.
                        </h1>
                        
                        <div class="hero-description">
                            <p>Build self-extending AI systems with native MCP & Agent-to-Agent communication. Your agents get smarter by creating their own capabilities.</p>
                            
                            <button class="get-started-btn" onclick="getStarted()">
                                <span>Get Started</span>
                                <svg width="20" height="20" viewBox="0 0 20 20">
                                    <path d="M4.17 10H15.83" stroke="#0E0E0E" stroke-width="1.25"/>
                                    <path d="M10 4.17L15.83 10L10 15.83" stroke="#0E0E0E" stroke-width="1.25" fill="none"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <script>
                const vscode = acquireVsCodeApi();
                
                function getStarted() {
                    vscode.postMessage({
                        command: 'openUserGuide'
                    });
                }
            </script>
        `

        return BaseTemplates.simpleHtml
            .replace('<%= cspSource %>', webview.cspSource)
            .replace(
                '<%= content %>',
                `<link rel="stylesheet" href="${homepageCssUri}">
                ${content}`
            )
    }

    public sendMessage(message: any): void {
        if (this.view) {
            this.view.webview.postMessage(message)
        }
    }
}

/**
 * Example command to show the homepage
 */
export function registerHomepageCommands(context: vscode.ExtensionContext): void {
    const provider = new HomepageViewProvider(context)

    // Register the webview provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(HomepageViewProvider.viewType, provider)
    )

    // Register command to open homepage
    context.subscriptions.push(
        vscode.commands.registerCommand('strandsAgents.showHomepage', () => {
            vscode.commands.executeCommand('workbench.view.extension.strandsAgents')
        })
    )
}