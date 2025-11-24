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
    },
    {
        type: "function",
        function: {
            name: "schedule_session",
            description: "Schedule a training session with a client. Use this when the user wants to book or create a session.",
            parameters: {
                type: "object",
                properties: {
                    clientId: {
                        type: "string",
                        description: "The ID of the client for this session"
                    },
                    scheduledAt: {
                        type: "string",
                        description: "ISO 8601 datetime string for when the session is scheduled (e.g., '2024-01-15T14:00:00Z')"
                    },
                    durationMinutes: {
                        type: "number",
                        description: "Duration of the session in minutes (default: 60)"
                    },
                    title: {
                        type: "string",
                        description: "Title/type of session (e.g., 'Tennis Lesson', 'Strength Training')"
                    },
                    notes: {
                        type: "string",
                        description: "Optional notes about the session"
                    }
                },
                required: ["clientId", "scheduledAt", "title"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "record_payment",
            description: "Record a payment received from a client. Use this when the user confirms receiving payment.",
            parameters: {
                type: "object",
                properties: {
                    clientId: {
                        type: "string",
                        description: "The ID of the client who made the payment"
                    },
                    amount: {
                        type: "number",
                        description: "Payment amount in dollars"
                    },
                    method: {
                        type: "string",
                        enum: ["CASH", "CARD", "BANK_TRANSFER", "VENMO", "PAYPAL", "OTHER"],
                        description: "Payment method used"
                    },
                    sessionId: {
                        type: "string",
                        description: "Optional session ID this payment is for"
                    },
                    notes: {
                        type: "string",
                        description: "Optional notes about the payment"
                    }
                },
                required: ["clientId", "amount", "method"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "save_program",
            description: "Save a training program or workout plan to the database. Use this when the user wants to save a program you've created.",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Title of the program"
                    },
                    description: {
                        type: "string",
                        description: "Brief description of the program"
                    },
                    content: {
                        type: "string",
                        description: "The full program content (can be markdown formatted)"
                    },
                    programType: {
                        type: "string",
                        enum: ["lesson_plan", "workout_program", "class_sequence", "drill_progression"],
                        description: "Type of program"
                    },
                    sportCategory: {
                        type: "string",
                        description: "Sport or activity this program is for (e.g., 'tennis', 'yoga')"
                    },
                    difficultyLevel: {
                        type: "string",
                        enum: ["beginner", "intermediate", "advanced"],
                        description: "Difficulty level"
                    },
                    durationMinutes: {
                        type: "number",
                        description: "Expected duration in minutes"
                    }
                },
                required: ["title", "content", "programType"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_upcoming_sessions",
            description: "Retrieve the trainer's upcoming sessions. Use this when the user asks about their schedule or calendar.",
            parameters: {
                type: "object",
                properties: {
                    daysAhead: {
                        type: "number",
                        description: "Number of days to look ahead (default: 7)"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_invoice",
            description: "Create an invoice for a client. Use this when the user wants to bill a client.",
            parameters: {
                type: "object",
                properties: {
                    clientId: {
                        type: "string",
                        description: "The ID of the client to invoice"
                    },
                    amount: {
                        type: "number",
                        description: "Invoice amount in dollars"
                    },
                    dueDate: {
                        type: "string",
                        description: "ISO 8601 date string for when payment is due"
                    },
                    description: {
                        type: "string",
                        description: "Description of what the invoice is for"
                    }
                },
                required: ["clientId", "amount"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "assign_program_to_client",
            description: "Assign a saved program to a specific client. Use this when the user wants to give a program to a client.",
            parameters: {
                type: "object",
                properties: {
                    programId: {
                        type: "string",
                        description: "The ID of the program to assign"
                    },
                    clientId: {
                        type: "string",
                        description: "The ID of the client to assign the program to"
                    }
                },
                required: ["programId", "clientId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "cancel_session",
            description: "Cancel a scheduled session. Use this when the user wants to cancel or remove a session.",
            parameters: {
                type: "object",
                properties: {
                    sessionId: {
                        type: "string",
                        description: "The ID of the session to cancel"
                    },
                    reason: {
                        type: "string",
                        description: "Optional reason for cancellation"
                    }
                },
                required: ["sessionId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_client_analytics",
            description: "Get analytics and progress metrics for a specific client. Use this when the user asks about a client's progress or statistics.",
            parameters: {
                type: "object",
                properties: {
                    clientId: {
                        type: "string",
                        description: "The ID of the client to get analytics for"
                    }
                },
                required: ["clientId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_revenue_summary",
            description: "Get revenue and financial summary. Use this when the user asks about earnings, income, or financial performance.",
            parameters: {
                type: "object",
                properties: {
                    startDate: {
                        type: "string",
                        description: "ISO 8601 date string for start of period (optional)"
                    },
                    endDate: {
                        type: "string",
                        description: "ISO 8601 date string for end of period (optional)"
                    }
                }
            }
        }
    }
]
