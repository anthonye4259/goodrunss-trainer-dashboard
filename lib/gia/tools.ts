/**
 * OpenAI Tool Definitions for GIA
 * These schemas describe the capabilities available to the AI agent.
 */

export const GIA_TOOLS = [
    {
        type: "function",
        function: {
            name: "update_client_profile",
            description: "Update a client's profile information such as weight, goals, injuries, or notes. Use this when the user explicitly asks to change client data.",
            parameters: {
                type: "object",
                properties: {
                    clientId: {
                        type: "string",
                        description: "The ID of the client to update. If not explicitly provided, try to infer from context or ask for clarification."
                    },
                    updates: {
                        type: "object",
                        description: "The fields to update",
                        properties: {
                            goals: {
                                type: "array",
                                items: { type: "string" },
                                description: "List of training goals (e.g., 'weight loss', 'marathon training')"
                            },
                            injuries: {
                                type: "array",
                                items: { type: "string" },
                                description: "List of current injuries or limitations"
                            },
                            notes: {
                                type: "string",
                                description: "General notes about the client, progress, or preferences"
                            },
                            skillLevel: {
                                type: "string",
                                enum: ["beginner", "intermediate", "advanced"],
                                description: "The client's skill level in their primary sport"
                            },
                            sport: {
                                type: "string",
                                description: "The client's primary sport or activity"
                            }
                        }
                    }
                },
                required: ["clientId", "updates"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_client",
            description: "Create a new client profile. Use this when the user asks to add or register a new person.",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Full name of the client"
                    },
                    email: {
                        type: "string",
                        description: "Client's email address (optional, generate placeholder if missing)"
                    },
                    sport: {
                        type: "string",
                        description: "Primary sport or activity"
                    },
                    notes: {
                        type: "string",
                        description: "Initial notes or context about the client"
                    }
                },
                required: ["name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_client_details",
            description: "Retrieve detailed information about a specific client. Use this when the user asks specific questions about a client's history or profile that isn't in the initial context.",
            parameters: {
                type: "object",
                properties: {
                    clientId: {
                        type: "string",
                        description: "The ID of the client to retrieve"
                    }
                },
                required: ["clientId"]
            }
        }
    }
]
