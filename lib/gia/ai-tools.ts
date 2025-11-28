import { z } from 'zod'
import { tool } from 'ai'
import { executeToolCall } from './functions'

// Wrapper to adapt existing tool execution logic to Vercel AI SDK
const createTool = (name: string, description: string, schema: z.ZodType<any, any>, trainerId: string) => {
    return tool({
        description,
        parameters: schema,
        execute: async (args) => {
            const result = await executeToolCall(name, args, trainerId)
            return result
        }
    })
}

export const getGiaTools = (trainerId: string) => ({
    update_client_profile: createTool(
        'update_client_profile',
        "Update a client's profile information such as weight, goals, injuries, or notes.",
        z.object({
            clientId: z.string().describe("The ID of the client to update"),
            updates: z.object({
                goals: z.array(z.string()).optional(),
                injuries: z.array(z.string()).optional(),
                notes: z.string().optional(),
                skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
                sport: z.string().optional()
            })
        }),
        trainerId
    ),
    create_client: createTool(
        'create_client',
        "Create a new client profile.",
        z.object({
            name: z.string().describe("Full name of the client"),
            email: z.string().optional().describe("Client's email address"),
            sport: z.string().optional().describe("Primary sport or activity"),
            notes: z.string().optional().describe("Initial notes")
        }),
        trainerId
    ),
    get_client_details: createTool(
        'get_client_details',
        "Retrieve detailed information about a specific client.",
        z.object({
            clientId: z.string().describe("The ID of the client to retrieve")
        }),
        trainerId
    ),
    schedule_session: createTool(
        'schedule_session',
        "Schedule a training session with a client.",
        z.object({
            clientId: z.string().describe("The ID of the client"),
            scheduledAt: z.string().describe("ISO 8601 datetime string"),
            durationMinutes: z.number().optional().describe("Duration in minutes"),
            title: z.string().describe("Title of session"),
            notes: z.string().optional()
        }),
        trainerId
    ),
    record_payment: createTool(
        'record_payment',
        "Record a payment received from a client.",
        z.object({
            clientId: z.string().describe("The ID of the client"),
            amount: z.number().describe("Payment amount"),
            method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "VENMO", "PAYPAL", "OTHER"]),
            sessionId: z.string().optional(),
            notes: z.string().optional()
        }),
        trainerId
    ),
    save_program: createTool(
        'save_program',
        "Save a training program or workout plan.",
        z.object({
            title: z.string(),
            description: z.string().optional(),
            content: z.string(),
            programType: z.enum(["lesson_plan", "workout_program", "class_sequence", "drill_progression"]),
            sportCategory: z.string().optional(),
            difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
            durationMinutes: z.number().optional()
        }),
        trainerId
    ),
    get_upcoming_sessions: createTool(
        'get_upcoming_sessions',
        "Retrieve the trainer's upcoming sessions.",
        z.object({
            daysAhead: z.number().optional().default(7)
        }),
        trainerId
    ),
    create_invoice: createTool(
        'create_invoice',
        "Create an invoice for a client.",
        z.object({
            clientId: z.string(),
            amount: z.number(),
            dueDate: z.string().optional(),
            description: z.string().optional()
        }),
        trainerId
    ),
    assign_program_to_client: createTool(
        'assign_program_to_client',
        "Assign a saved program to a specific client.",
        z.object({
            programId: z.string(),
            clientId: z.string()
        }),
        trainerId
    ),
    cancel_session: createTool(
        'cancel_session',
        "Cancel a scheduled session.",
        z.object({
            sessionId: z.string(),
            reason: z.string().optional()
        }),
        trainerId
    ),
    get_client_analytics: createTool(
        'get_client_analytics',
        "Get analytics and progress metrics for a specific client.",
        z.object({
            clientId: z.string()
        }),
        trainerId
    ),
    get_revenue_summary: createTool(
        'get_revenue_summary',
        "Get revenue and financial summary.",
        z.object({
            startDate: z.string().optional(),
            endDate: z.string().optional()
        }),
        trainerId
    ),
    get_hot_leads: createTool(
        'get_hot_leads',
        "Get a list of high-potential leads.",
        z.object({
            minScore: z.number().optional().default(70)
        }),
        trainerId
    ),
    get_churn_risk: createTool(
        'get_churn_risk',
        "Identify clients at risk of leaving (churning).",
        z.object({}),
        trainerId
    ),
    generate_lead_outreach: createTool(
        'generate_lead_outreach',
        "Generate a personalized outreach message for a lead.",
        z.object({
            leadId: z.string(),
            tone: z.enum(["professional", "casual", "enthusiastic", "direct"]).optional()
        }),
        trainerId
    )
})
