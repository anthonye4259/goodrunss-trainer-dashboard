import { MCP_TOOLS, executeTool } from '@/lib/mcp/tools'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * MCP (Model Context Protocol) Server for ChatGPT Integration
 * 
 * Implements JSON-RPC 2.0 protocol for ChatGPT to call GoodRunss tools.
 * 
 * Endpoints:
 * - POST: Handle JSON-RPC requests (tools/list, tools/call)
 * - GET: Health check / server info
 */

interface JsonRpcRequest {
    jsonrpc: '2.0'
    method: string
    params?: Record<string, any>
    id?: string | number
}

interface JsonRpcResponse {
    jsonrpc: '2.0'
    result?: any
    error?: {
        code: number
        message: string
        data?: any
    }
    id: string | number | null
}

function jsonRpcError(id: string | number | null, code: number, message: string, data?: any): JsonRpcResponse {
    return {
        jsonrpc: '2.0',
        error: { code, message, data },
        id
    }
}

function jsonRpcSuccess(id: string | number | null, result: any): JsonRpcResponse {
    return {
        jsonrpc: '2.0',
        result,
        id
    }
}

export async function GET() {
    return Response.json({
        name: 'GoodRunss MCP Server',
        version: '1.0.0',
        description: 'AI-powered sports and wellness platform. Find courts, trainers, and get fitness advice.',
        protocol: 'mcp',
        capabilities: {
            tools: true,
            resources: false,
            prompts: false
        },
        tools: MCP_TOOLS.map(t => ({
            name: t.name,
            description: t.description
        }))
    })
}

export async function POST(request: Request) {
    try {
        const body: JsonRpcRequest = await request.json()

        // Validate JSON-RPC format
        if (body.jsonrpc !== '2.0') {
            return Response.json(
                jsonRpcError(body.id ?? null, -32600, 'Invalid Request: jsonrpc must be "2.0"'),
                { status: 400 }
            )
        }

        const { method, params, id } = body

        // Handle different MCP methods
        switch (method) {
            case 'initialize':
                return Response.json(jsonRpcSuccess(id ?? null, {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: 'GoodRunss',
                        version: '1.0.0'
                    }
                }))

            case 'tools/list':
                return Response.json(jsonRpcSuccess(id ?? null, {
                    tools: MCP_TOOLS.map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.inputSchema
                    }))
                }))

            case 'tools/call':
                if (!params?.name) {
                    return Response.json(
                        jsonRpcError(id ?? null, -32602, 'Invalid params: tool name required'),
                        { status: 400 }
                    )
                }

                const tool = MCP_TOOLS.find(t => t.name === params.name)
                if (!tool) {
                    return Response.json(
                        jsonRpcError(id ?? null, -32601, `Tool not found: ${params.name}`),
                        { status: 404 }
                    )
                }

                try {
                    const result = await executeTool(params.name, params.arguments || {})
                    return Response.json(jsonRpcSuccess(id ?? null, {
                        content: [
                            {
                                type: 'text',
                                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                            }
                        ]
                    }))
                } catch (error: any) {
                    return Response.json(
                        jsonRpcError(id ?? null, -32000, error.message || 'Tool execution failed'),
                        { status: 500 }
                    )
                }

            case 'notifications/initialized':
                // Client notification that initialization is complete
                return Response.json(jsonRpcSuccess(id ?? null, {}))

            default:
                return Response.json(
                    jsonRpcError(id ?? null, -32601, `Method not found: ${method}`),
                    { status: 404 }
                )
        }
    } catch (error: any) {
        console.error('MCP error:', error)
        return Response.json(
            jsonRpcError(null, -32700, 'Parse error: Invalid JSON'),
            { status: 400 }
        )
    }
}
