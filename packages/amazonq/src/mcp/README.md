# Amazon Q MCP Server

This implements an MCP (Model Context Protocol) server for Amazon Q, allowing external applications to interact with Amazon Q functionality through a standardized protocol.

## Overview

The MCP server runs as an HTTP server (default port 3001) and exposes Amazon Q capabilities as MCP tools that can be called by external MCP clients.

## Available Tools

### `load_chat_session`

Opens a new Amazon Q chat session with an optional initial message.

**Parameters:**
- `message` (string, optional): Initial message to start the chat session. Defaults to "Hello world"

**Example usage:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "load_chat_session",
    "arguments": {
      "message": "Help me debug this code"
    }
  }
}
```

## Configuration

Configure the MCP server through VS Code settings:

- `amazonQ.mcp.enabled` (boolean): Enable/disable the MCP server (default: true)
- `amazonQ.mcp.port` (number): Port for the server to listen on (default: 3001, range: 1024-65535)

## Testing

Use the included test script to verify the MCP server functionality:

```bash
node test-mcp.js [port]
```

## Protocol Details

The server implements MCP using JSON-RPC 2.0 over HTTP. It supports:

- `initialize` - Initialize the MCP connection
- `tools/list` - List available tools
- `tools/call` - Execute a tool

All responses include CORS headers to allow cross-origin requests from web-based MCP clients.

## Architecture

- `types.ts` - TypeScript interfaces for MCP protocol
- `server.ts` - Main MCP server implementation
- `activation.ts` - VS Code extension activation/deactivation
- `index.ts` - Public API exports