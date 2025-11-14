// GIA Function Definitions - What GIA Can Do
// Anthropic Function Calling Setup

export const giaFunctions = [
  // ═══════════════════════════════════════════════════════════════
  // 📅 CALENDAR FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "create_calendar_event",
    description: "Create a new calendar event/session with a client",
    input_schema: {
      type: "object",
      properties: {
        clientName: {
          type: "string",
          description: "Client's name (first name or full name)"
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format (e.g., 2025-11-11). If user says 'tomorrow', 'next Monday', etc., convert to actual date."
        },
        time: {
          type: "string",
          description: "Time in HH:MM 24-hour format (e.g., 14:00 for 2pm)"
        },
        duration: {
          type: "number",
          description: "Duration in minutes (default 60)"
        },
        sessionType: {
          type: "string",
          description: "Type of session (e.g., Tennis, Fitness, Yoga)"
        },
        location: {
          type: "string",
          description: "Session location"
        },
        notes: {
          type: "string",
          description: "Any additional notes"
        }
      },
      required: ["clientName", "date", "time"]
    }
  },
  {
    name: "get_schedule",
    description: "Get the trainer's schedule for a specific date or date range",
    input_schema: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "Start date in YYYY-MM-DD format. For 'today', use current date."
        },
        endDate: {
          type: "string",
          description: "End date in YYYY-MM-DD format (optional, defaults to startDate)"
        }
      },
      required: ["startDate"]
    }
  },
  {
    name: "update_calendar_event",
    description: "Update/reschedule an existing calendar event",
    input_schema: {
      type: "object",
      properties: {
        eventId: {
          type: "string",
          description: "Event ID to update"
        },
        newDate: {
          type: "string",
          description: "New date (YYYY-MM-DD)"
        },
        newTime: {
          type: "string",
          description: "New time (HH:MM)"
        },
        newDuration: {
          type: "number",
          description: "New duration in minutes"
        }
      },
      required: ["eventId"]
    }
  },
  {
    name: "cancel_event",
    description: "Cancel a calendar event/session",
    input_schema: {
      type: "object",
      properties: {
        eventId: {
          type: "string",
          description: "Event ID to cancel"
        },
        reason: {
          type: "string",
          description: "Cancellation reason"
        },
        notifyClient: {
          type: "boolean",
          description: "Whether to notify the client (default true)"
        }
      },
      required: ["eventId"]
    }
  },
  {
    name: "find_available_slots",
    description: "Find available time slots in the trainer's schedule",
    input_schema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Date to check (YYYY-MM-DD)"
        },
        duration: {
          type: "number",
          description: "Required duration in minutes"
        }
      },
      required: ["date"]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 👥 CLIENT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "create_client",
    description: "Add a new client to the system",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Client's full name"
        },
        email: {
          type: "string",
          description: "Client's email address"
        },
        phone: {
          type: "string",
          description: "Client's phone number"
        },
        notes: {
          type: "string",
          description: "Any notes about the client"
        }
      },
      required: ["name", "email"]
    }
  },
  {
    name: "search_clients",
    description: "Search for clients by name or email",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term (name or email)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_client_details",
    description: "Get detailed information about a specific client including session history",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        }
      },
      required: ["clientId"]
    }
  },
  {
    name: "get_client_list",
    description: "Get a list of all clients with optional filters",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["active", "inactive", "all"],
          description: "Filter by client status"
        },
        limit: {
          type: "number",
          description: "Maximum number of clients to return"
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 💰 PAYMENT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "create_invoice",
    description: "Create and send an invoice to a client",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        },
        amount: {
          type: "number",
          description: "Invoice amount in dollars"
        },
        description: {
          type: "string",
          description: "Invoice description/items"
        },
        dueDate: {
          type: "string",
          description: "Due date (YYYY-MM-DD)"
        }
      },
      required: ["clientId", "amount"]
    }
  },
  {
    name: "get_revenue_stats",
    description: "Get revenue statistics for a time period",
    input_schema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["today", "week", "month", "year"],
          description: "Time period to analyze"
        },
        startDate: {
          type: "string",
          description: "Custom start date (YYYY-MM-DD)"
        },
        endDate: {
          type: "string",
          description: "Custom end date (YYYY-MM-DD)"
        }
      },
      required: ["period"]
    }
  },
  {
    name: "get_pending_payments",
    description: "Get list of pending/unpaid invoices",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Filter by specific client (optional)"
        }
      }
    }
  },
  {
    name: "mark_payment_received",
    description: "Mark an invoice as paid",
    input_schema: {
      type: "object",
      properties: {
        invoiceId: {
          type: "string",
          description: "Invoice ID to mark as paid"
        },
        paymentMethod: {
          type: "string",
          description: "Payment method (cash, card, etc.)"
        }
      },
      required: ["invoiceId"]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 💬 MESSAGING FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "send_message",
    description: "Send a message to a client",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name to send message to"
        },
        message: {
          type: "string",
          description: "Message content"
        },
        attachments: {
          type: "array",
          items: { type: "string" },
          description: "Array of attachment URLs"
        }
      },
      required: ["clientId", "message"]
    }
  },
  {
    name: "send_bulk_message",
    description: "Send a message to multiple clients",
    input_schema: {
      type: "object",
      properties: {
        recipients: {
          type: "string",
          enum: ["all", "active", "specific"],
          description: "Who to send to"
        },
        message: {
          type: "string",
          description: "Message content"
        },
        clientIds: {
          type: "array",
          items: { type: "string" },
          description: "Specific client IDs (if recipients is 'specific')"
        }
      },
      required: ["recipients", "message"]
    }
  },
  {
    name: "get_recent_messages",
    description: "Get recent messages from clients",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Filter by specific client (optional)"
        },
        limit: {
          type: "number",
          description: "Number of messages to retrieve (default 10)"
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 💪 WORKOUT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "generate_workout_plan",
    description: "Generate a personalized AI workout plan for a client",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        },
        goal: {
          type: "string",
          description: "Fitness goal (strength, cardio, weight loss, etc.)"
        },
        duration: {
          type: "number",
          description: "Plan duration in weeks"
        },
        sessionsPerWeek: {
          type: "number",
          description: "Number of sessions per week"
        },
        equipment: {
          type: "array",
          items: { type: "string" },
          description: "Available equipment"
        },
        restrictions: {
          type: "string",
          description: "Any injuries or restrictions"
        }
      },
      required: ["clientId", "goal"]
    }
  },
  {
    name: "send_workout_plan",
    description: "Send a workout plan to a client",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        },
        workoutPlanId: {
          type: "string",
          description: "Workout plan ID to send"
        }
      },
      required: ["clientId", "workoutPlanId"]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 📊 ANALYTICS FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "get_session_stats",
    description: "Get statistics about completed sessions",
    input_schema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["today", "week", "month", "year"],
          description: "Time period to analyze"
        }
      },
      required: ["period"]
    }
  },
  {
    name: "get_client_stats",
    description: "Get statistics about clients (total, active, new, etc.)",
    input_schema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["today", "week", "month", "year"],
          description: "Time period to analyze"
        }
      }
    }
  },
  {
    name: "get_performance_summary",
    description: "Get overall performance summary (revenue, sessions, clients, ratings)",
    input_schema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["week", "month", "quarter", "year"],
          description: "Time period to analyze"
        }
      },
      required: ["period"]
    }
  },
  {
    name: "generate_report",
    description: "Generate a detailed report (PDF or CSV)",
    input_schema: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: ["revenue", "sessions", "clients", "comprehensive"],
          description: "Type of report to generate"
        },
        format: {
          type: "string",
          enum: ["pdf", "csv"],
          description: "Report format"
        },
        startDate: {
          type: "string",
          description: "Report start date (YYYY-MM-DD)"
        },
        endDate: {
          type: "string",
          description: "Report end date (YYYY-MM-DD)"
        }
      },
      required: ["reportType"]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI PERSONA FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "get_persona_earnings",
    description: "Get AI Persona earnings and usage statistics",
    input_schema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["today", "week", "month", "all"],
          description: "Time period to analyze"
        }
      }
    }
  },
  {
    name: "get_persona_stats",
    description: "Get detailed AI Persona statistics (sessions, ratings, popular questions)",
    input_schema: {
      type: "object",
      properties: {}
    }
  }
];

export type GIAFunctionName = typeof giaFunctions[number]["name"];

