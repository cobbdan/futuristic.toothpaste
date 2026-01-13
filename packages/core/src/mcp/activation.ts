/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { AwsMcpServer } from './server'
import { getLogger } from '../shared/logger/logger'
import { Settings } from '../shared/settings'

let mcpServer: AwsMcpServer | undefined

/**
 * Activates the MCP server for the AWS Toolkit
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const logger = getLogger()
    
    try {
        // Check if MCP server is enabled in settings
        const settings = Settings.instance
        const mcpEnabled = settings.get('aws.mcp.enabled', true)
        const mcpPort = settings.get('aws.mcp.port', 3000)
        
        if (!mcpEnabled) {
            logger.info('MCP Server is disabled in settings')
            return
        }

        logger.info('Activating AWS Toolkit MCP Server...')
        
        mcpServer = AwsMcpServer.getInstance()
        await mcpServer.start(mcpPort)
        
        const actualPort = mcpServer.getPort()
        logger.info(`AWS Toolkit MCP Server started successfully on port ${actualPort}`)
        
        // Register command to restart MCP server
        const restartCommand = vscode.commands.registerCommand('aws.mcp.restart', async () => {
            try {
                if (mcpServer && !mcpServer.closed) {
                    await mcpServer.close()
                }
                
                const newPort = settings.get('aws.mcp.port', 3000)
                mcpServer = AwsMcpServer.getInstance()
                await mcpServer.start(newPort)
                
                vscode.window.showInformationMessage(`MCP Server restarted on port ${mcpServer.getPort()}`)
                logger.info(`MCP Server restarted on port ${mcpServer.getPort()}`)
            } catch (error) {
                const message = `Failed to restart MCP Server: ${(error as Error).message}`
                vscode.window.showErrorMessage(message)
                logger.error(message, error)
            }
        })
        
        // Register command to stop MCP server
        const stopCommand = vscode.commands.registerCommand('aws.mcp.stop', async () => {
            try {
                if (mcpServer && !mcpServer.closed) {
                    await mcpServer.close()
                    vscode.window.showInformationMessage('MCP Server stopped')
                    logger.info('MCP Server stopped by user command')
                } else {
                    vscode.window.showInformationMessage('MCP Server is not running')
                }
            } catch (error) {
                const message = `Failed to stop MCP Server: ${(error as Error).message}`
                vscode.window.showErrorMessage(message)
                logger.error(message, error)
            }
        })
        
        // Register command to show MCP server status
        const statusCommand = vscode.commands.registerCommand('aws.mcp.status', () => {
            if (mcpServer && !mcpServer.closed) {
                const port = mcpServer.getPort()
                vscode.window.showInformationMessage(`MCP Server is running on port ${port}`)
            } else {
                vscode.window.showInformationMessage('MCP Server is not running')
            }
        })
        
        context.subscriptions.push(restartCommand, stopCommand, statusCommand)
        
        // Listen for configuration changes
        const configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('aws.mcp')) {
                logger.info('MCP configuration changed, restart may be required')
                vscode.window.showInformationMessage(
                    'MCP Server configuration changed. Restart the server to apply changes.',
                    'Restart Now'
                ).then((action) => {
                    if (action === 'Restart Now') {
                        vscode.commands.executeCommand('aws.mcp.restart')
                    }
                })
            }
        })
        
        context.subscriptions.push(configChangeListener)
        
    } catch (error) {
        const message = `Failed to start MCP Server: ${(error as Error).message}`
        logger.error(message, error)
        
        // Don't throw the error to prevent extension activation failure
        // Just show a warning to the user
        vscode.window.showWarningMessage(
            `AWS Toolkit MCP Server failed to start: ${(error as Error).message}`,
            'Retry'
        ).then((action) => {
            if (action === 'Retry') {
                vscode.commands.executeCommand('aws.mcp.restart')
            }
        })
    }
}

/**
 * Deactivates the MCP server
 */
export async function deactivate(): Promise<void> {
    if (mcpServer && !mcpServer.closed) {
        try {
            await mcpServer.close()
            getLogger().info('MCP Server deactivated successfully')
        } catch (error) {
            getLogger().error('Error deactivating MCP Server:', error)
        }
    }
}