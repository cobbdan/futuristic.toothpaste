/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as http from 'http'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { getLogger } from '../shared/logger/logger'
import { ToolkitError } from '../shared/errors'
import { Socket } from 'net'
import * as vscode from 'vscode'

export class McpServerError extends ToolkitError {
    constructor(message: string, code?: string) {
        super(`MCP Server: ${message}`, { code: code || 'McpServerError' })
    }
}

/**
 * MCP (Model Context Protocol) Server for AWS Toolkit
 * Provides external access to toolkit functionality via MCP tools
 */
export class AwsMcpServer {
    private static instance: AwsMcpServer | undefined
    
    private server: Server
    private httpServer: http.Server | undefined
    private connections: Socket[] = []
    private _closed: boolean = false
    private port: number = 3000

    private constructor() {
        this.server = new Server(
            {
                name: 'aws-toolkit-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        )

        this.setupToolHandlers()
    }

    public static getInstance(): AwsMcpServer {
        if (!AwsMcpServer.instance) {
            AwsMcpServer.instance = new AwsMcpServer()
        }
        return AwsMcpServer.instance
    }

    private setupToolHandlers() {
        // Register list_tools handler
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'load_chat_session',
                        description: 'Opens a new chat session with a greeting message',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    description: 'Optional custom message to start the chat session with',
                                    default: 'Hello world'
                                }
                            },
                            additionalProperties: false
                        }
                    }
                ]
            }
        })

        // Register call_tool handler
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params

            if (name === 'load_chat_session') {
                try {
                    const message = (args as any)?.message || 'Hello world'
                    await this.loadChatSession(message)
                    
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Chat session opened with message: "${message}"`
                            }
                        ]
                    }
                } catch (error) {
                    getLogger().error('Failed to load chat session:', error)
                    throw new McpServerError(`Failed to load chat session: ${(error as Error).message}`)
                }
            }

            throw new McpServerError(`Unknown tool: ${name}`)
        })
    }

    private async loadChatSession(message: string): Promise<void> {
        try {
            // Try to open Amazon Q chat if available
            const amazonQExtension = vscode.extensions.getExtension('amazonwebservices.amazon-q-vscode')
            
            if (amazonQExtension) {
                // If Amazon Q extension is available, try to use its chat functionality
                await vscode.commands.executeCommand('aws.amazonq.openChat')
                
                // Wait a moment for the chat to open, then send the message
                setTimeout(async () => {
                    try {
                        await vscode.commands.executeCommand('aws.amazonq.sendToChat', message)
                    } catch (error) {
                        getLogger().warn('Failed to send message to Amazon Q chat, falling back to notification:', error)
                        await this.fallbackChatSession(message)
                    }
                }, 500)
            } else {
                // Fallback to showing the message in a notification or output channel
                await this.fallbackChatSession(message)
            }
        } catch (error) {
            getLogger().error('Error in loadChatSession:', error)
            await this.fallbackChatSession(message)
        }
    }

    private async fallbackChatSession(message: string): Promise<void> {
        // Fallback: show the message in an information dialog
        const action = await vscode.window.showInformationMessage(
            `Chat Session Started: ${message}`,
            'Open Output',
            'Dismiss'
        )
        
        if (action === 'Open Output') {
            // Show in AWS Toolkit output channel
            const outputChannel = vscode.window.createOutputChannel('AWS Toolkit MCP Chat')
            outputChannel.appendLine(`[${new Date().toISOString()}] Chat Session: ${message}`)
            outputChannel.show()
        }
    }

    public async start(port?: number): Promise<void> {
        if (this.httpServer?.listening) {
            throw new McpServerError('Server already started')
        }

        this.port = port || this.port

        return new Promise<void>((resolve, reject) => {
            this.httpServer = http.createServer(async (req, res) => {
                // Enable CORS for local development
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

                if (req.method === 'OPTIONS') {
                    res.writeHead(200)
                    res.end()
                    return
                }

                if (req.method !== 'POST') {
                    res.writeHead(405, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ error: 'Method not allowed' }))
                    return
                }

                let body = ''
                req.on('data', chunk => {
                    body += chunk.toString()
                })

                req.on('end', async () => {
                    try {
                        const jsonRpcRequest = JSON.parse(body)
                        
                        // Create a simple transport for handling the request
                        const transport = new StdioServerTransport()
                        
                        // Handle the request through the MCP server
                        const response = await this.server.handleRequest(jsonRpcRequest)
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify(response))
                    } catch (error) {
                        getLogger().error('MCP Server request error:', error)
                        res.writeHead(500, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({ 
                            error: 'Internal server error',
                            message: (error as Error).message 
                        }))
                    }
                })
            })

            this.httpServer.on('connection', (connection) => {
                this.connections.push(connection)
            })

            this.httpServer.on('error', (error) => {
                getLogger().error('MCP Server error:', error)
                reject(new McpServerError(`Server failed: ${error.message}`))
            })

            this.httpServer.on('listening', () => {
                const address = this.httpServer?.address()
                if (!address) {
                    reject(new McpServerError('Failed to get server address'))
                    return
                }
                
                const actualPort = typeof address === 'string' ? parseInt(address) : address.port
                getLogger().info(`MCP Server listening on port ${actualPort}`)
                resolve()
            })

            this.httpServer.listen(this.port, '127.0.0.1')
        })
    }

    public async close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._closed) {
                resolve()
                return
            }

            if (!this.httpServer?.listening) {
                reject(new McpServerError('Server not started'))
                return
            }

            getLogger().debug('MCP Server: Attempting to close server.')

            // Close all connections
            for (const connection of this.connections) {
                connection.destroy()
            }

            this.httpServer.close((err) => {
                if (err) {
                    reject(new McpServerError(`Failed to close server: ${err.message}`))
                    return
                }
                
                this._closed = true
                getLogger().debug('MCP Server: Server closed successfully.')
                resolve()
            })
        })
    }

    public get closed(): boolean {
        return this._closed
    }

    public getAddress() {
        return this.httpServer?.address()
    }

    public getPort(): number {
        const addr = this.getAddress()
        if (addr && typeof addr === 'object') {
            return addr.port
        }
        return this.port
    }
}