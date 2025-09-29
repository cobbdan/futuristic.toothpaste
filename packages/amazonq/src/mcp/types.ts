/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * MCP (Model Context Protocol) type definitions
 */

export interface JsonRpcRequest {
    jsonrpc: '2.0'
    id: string | number | null
    method: string
    params?: any
}

export interface JsonRpcResponse {
    jsonrpc: '2.0'
    id: string | number | null
    result?: any
    error?: JsonRpcError
}

export interface JsonRpcError {
    code: number
    message: string
    data?: any
}

export interface McpTool {
    name: string
    description: string
    inputSchema: {
        type: 'object'
        properties: Record<string, any>
        required?: string[]
    }
}

export interface McpToolCall {
    name: string
    arguments: Record<string, any>
}

export interface McpToolResult {
    content: Array<{
        type: 'text'
        text: string
    }>
    isError?: boolean
}

export interface McpServerCapabilities {
    tools?: {
        listChanged?: boolean
    }
}