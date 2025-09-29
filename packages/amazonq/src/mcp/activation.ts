/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { McpServer } from './server'
import { getLogger } from 'aws-core-vscode/shared'

let mcpServer: McpServer | undefined

export async function activateMcp(context: vscode.ExtensionContext): Promise<void> {
    const logger = getLogger('amazonq.mcp.activation')

    try {
        // Get port from configuration, default to 3001
        const config = vscode.workspace.getConfiguration('amazonQ')
        const port = config.get<number>('mcp.port', 3001)
        const enabled = config.get<boolean>('mcp.enabled', true)

        if (!enabled) {
            logger.info('MCP server is disabled via configuration')
            return
        }

        mcpServer = new McpServer(port)
        await mcpServer.start()

        logger.info(`MCP server activated on port ${port}`)

        // Ensure the server is stopped when the extension is deactivated
        context.subscriptions.push({
            dispose: async () => {
                if (mcpServer) {
                    await mcpServer.stop()
                    mcpServer = undefined
                }
            }
        })

        // Watch for configuration changes
        const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('amazonQ.mcp')) {
                logger.info('MCP configuration changed, restart may be required')
                vscode.window.showInformationMessage(
                    'Amazon Q MCP settings changed. Please reload VS Code for changes to take effect.',
                    'Reload Now'
                ).then((selection) => {
                    if (selection === 'Reload Now') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow')
                    }
                })
            }
        })

        context.subscriptions.push(configWatcher)

    } catch (error) {
        logger.error('Failed to activate MCP server:', error)

        if (error instanceof Error && error.message.includes('EADDRINUSE')) {
            vscode.window.showErrorMessage(
                `Amazon Q MCP server failed to start: Port ${mcpServer?.port || 3001} is already in use. Please change the port in settings.`,
                'Open Settings'
            ).then((selection) => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'amazonQ.mcp')
                }
            })
        } else {
            vscode.window.showErrorMessage(`Amazon Q MCP server failed to start: ${error instanceof Error ? error.message : String(error)}`)
        }
    }
}

export async function deactivateMcp(): Promise<void> {
    if (mcpServer) {
        await mcpServer.stop()
        mcpServer = undefined
    }
}