/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as http from 'http'
import * as vscode from 'vscode'
import { getLogger } from 'aws-core-vscode/shared'
import { focusAmazonQPanel } from 'aws-core-vscode/codewhispererChat'
import type {
    JsonRpcRequest,
    JsonRpcResponse,
    JsonRpcError,
    McpTool,
    McpToolCall,
    McpToolResult,
    McpServerCapabilities
} from './types'

export class McpServer {
    private server: http.Server | undefined
    private port: number
    private logger = getLogger('amazonq.mcp')
    private tools: Map<string, McpTool> = new Map()
    private toolHandlers: Map<string, (args: Record<string, any>) => Promise<McpToolResult>> = new Map()

    constructor(port: number = 3001) {
        this.port = port
        this.registerDefaultTools()
    }

    private registerDefaultTools() {
        const loadChatSessionTool: McpTool = {
            name: 'load_chat_session',
            description: 'Opens a new Amazon Q chat session with a specified message',
            inputSchema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        description: 'Initial message to start the chat session with',
                        default: 'Hello world'
                    }
                },
                required: []
            }
        }

        this.tools.set('load_chat_session', loadChatSessionTool)
        this.toolHandlers.set('load_chat_session', this.handleLoadChatSession.bind(this))
    }

    private async handleLoadChatSession(args: Record<string, any>): Promise<McpToolResult> {
        const message = args.message || 'Hello world'

        try {
            await focusAmazonQPanel.execute(vscode.window, 'mcp-server')

            // Give the chat panel time to open, then send the initial message
            setTimeout(async () => {
                try {
                    await vscode.commands.executeCommand('aws.amazonq.sendToPrompt', message)
                } catch (error) {
                    this.logger.error('Failed to send initial message to chat:', error)
                }
            }, 500)

            return {
                content: [{
                    type: 'text',
                    text: `Amazon Q chat session opened with message: "${message}"`
                }]
            }
        } catch (error) {
            this.logger.error('Failed to load chat session:', error)
            return {
                content: [{
                    type: 'text',
                    text: `Failed to open chat session: ${error instanceof Error ? error.message : String(error)}`
                }],
                isError: true
            }
        }
    }

    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.server = http.createServer((req, res) => {
                    this.handleHttpRequest(req, res)
                })

                this.server.listen(this.port, () => {
                    this.logger.info(`MCP Server started on port ${this.port}`)
                    resolve()
                })

                this.server.on('error', (error) => {
                    this.logger.error('MCP Server error:', error)
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    public async stop(): Promise<void> {
        if (this.server) {
            return new Promise((resolve) => {
                this.server!.close(() => {
                    this.logger.info('MCP Server stopped')
                    resolve()
                })
            })
        }
    }

    private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
        // Enable CORS for all origins
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
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
        req.on('data', (chunk) => {
            body += chunk.toString()
        })

        req.on('end', async () => {
            try {
                const jsonRpcRequest: JsonRpcRequest = JSON.parse(body)
                const response = await this.handleJsonRpcRequest(jsonRpcRequest)

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(response))
            } catch (error) {
                this.logger.error('Failed to handle HTTP request:', error)
                const errorResponse: JsonRpcResponse = {
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32700,
                        message: 'Parse error'
                    }
                }
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(errorResponse))
            }
        })
    }

    private async handleJsonRpcRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
        const { id, method, params } = request

        try {
            switch (method) {
                case 'initialize':
                    return this.handleInitialize(id, params)
                case 'tools/list':
                    return this.handleToolsList(id)
                case 'tools/call':
                    return await this.handleToolsCall(id, params)
                default:
                    return {
                        jsonrpc: '2.0',
                        id,
                        error: {
                            code: -32601,
                            message: `Method not found: ${method}`
                        }
                    }
            }
        } catch (error) {
            this.logger.error('Error handling JSON-RPC request:', error)
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: 'Internal error',
                    data: error instanceof Error ? error.message : String(error)
                }
            }
        }
    }

    private handleInitialize(id: string | number | null, params: any): JsonRpcResponse {
        const capabilities: McpServerCapabilities = {
            tools: {
                listChanged: true
            }
        }

        return {
            jsonrpc: '2.0',
            id,
            result: {
                protocolVersion: '2024-11-05',
                capabilities,
                serverInfo: {
                    name: 'amazon-q-mcp-server',
                    version: '1.0.0'
                }
            }
        }
    }

    private handleToolsList(id: string | number | null): JsonRpcResponse {
        const tools = Array.from(this.tools.values())

        return {
            jsonrpc: '2.0',
            id,
            result: {
                tools
            }
        }
    }

    private async handleToolsCall(id: string | number | null, params: any): Promise<JsonRpcResponse> {
        if (!params || !params.name) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32602,
                    message: 'Invalid params: tool name is required'
                }
            }
        }

        const { name, arguments: args } = params as McpToolCall
        const handler = this.toolHandlers.get(name)

        if (!handler) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32602,
                    message: `Unknown tool: ${name}`
                }
            }
        }

        try {
            const result = await handler(args || {})
            return {
                jsonrpc: '2.0',
                id,
                result
            }
        } catch (error) {
            this.logger.error(`Error executing tool ${name}:`, error)
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
                }
            }
        }
    }
}