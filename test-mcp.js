#!/usr/bin/env node
/**
 * Simple test script for Amazon Q MCP server
 */

const http = require('http');

const testRequests = [
    {
        name: 'initialize',
        data: {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: {
                    name: 'test-client',
                    version: '1.0.0'
                }
            }
        }
    },
    {
        name: 'tools/list',
        data: {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list'
        }
    },
    {
        name: 'tools/call load_chat_session',
        data: {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'load_chat_session',
                arguments: {
                    message: 'Hello from MCP test!'
                }
            }
        }
    }
];

async function testMcpServer(port = 3001) {
    console.log(`Testing Amazon Q MCP server on port ${port}...\n`);

    for (const test of testRequests) {
        try {
            console.log(`Testing: ${test.name}`);
            const response = await makeRequest(port, test.data);
            console.log(`✅ ${test.name}:`, JSON.stringify(response, null, 2));
            console.log('');
        } catch (error) {
            console.log(`❌ ${test.name} failed:`, error.message);
            console.log('');
        }
    }
}

function makeRequest(port, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Run the test
const port = process.argv[2] || 3001;
testMcpServer(port).catch(console.error);