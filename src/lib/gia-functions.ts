// GIA Function Definitions - What GIA Can Do
// Anthropic Function Calling Setup

export const giaFunctions = [
  // ═══════════════════════════════════════════════════════════════
  // 📅 CALENDAR FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "create_calendar_event",
    description: "Create a new calendar event/session - supports 1-on-1, small groups (3-5), medium classes (6-15), or large classes (16+)",
    input_schema: {
      type: "object",
      properties: {
        clientName: {
          type: "string",
          description: "Client's name for 1-on-1 sessions (first name or full name)"
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
          description: "Type of session (e.g., Tennis, Fitness, Yoga, Pilates Class)"
        },
        sessionFormat: {
          type: "string",
          enum: ["private", "semi_private", "small_group", "class", "large_class"],
          description: "Session format: private (1-on-1), semi_private (2-3), small_group (4-8), class (9-20), large_class (21+)"
        },
        maxCapacity: {
          type: "number",
          description: "Maximum number of participants (for groups/classes)"
        },
        pricePerPerson: {
          type: "number",
          description: "Price per person (for groups/classes)"
        },
        location: {
          type: "string",
          description: "Session location"
        },
        notes: {
          type: "string",
          description: "Any additional notes"
        },
        recurring: {
          type: "boolean",
          description: "Is this a recurring class? (default: false)"
        },
        recurringPattern: {
          type: "string",
          description: "If recurring: 'weekly', 'biweekly', 'monthly', or custom pattern"
        }
      },
      required: ["date", "time"]
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
  {
    name: "create_group_class",
    description: "Create a group class or large session (10+ people) with capacity management, waitlist, and pricing",
    input_schema: {
      type: "object",
      properties: {
        className: {
          type: "string",
          description: "Class name (e.g., 'Morning Boot Camp', 'Vinyasa Flow', 'Pilates Reformer')"
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format"
        },
        time: {
          type: "string",
          description: "Time in HH:MM format"
        },
        duration: {
          type: "number",
          description: "Duration in minutes"
        },
        maxCapacity: {
          type: "number",
          description: "Maximum number of participants"
        },
        pricePerPerson: {
          type: "number",
          description: "Price per person in dollars"
        },
        location: {
          type: "string",
          description: "Class location"
        },
        description: {
          type: "string",
          description: "Class description for marketing"
        },
        level: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced", "all_levels"],
          description: "Class difficulty level"
        },
        recurring: {
          type: "boolean",
          description: "Is this a recurring class?"
        },
        recurringPattern: {
          type: "string",
          description: "Recurring pattern: 'every_monday', 'every_week', 'twice_weekly', etc."
        }
      },
      required: ["className", "date", "time", "maxCapacity", "pricePerPerson"]
    }
  },
  {
    name: "manage_class_roster",
    description: "View, add, or remove participants from a group class roster",
    input_schema: {
      type: "object",
      properties: {
        classId: {
          type: "string",
          description: "Class/session ID"
        },
        action: {
          type: "string",
          enum: ["view_roster", "add_participant", "remove_participant", "check_capacity"],
          description: "What to do with the roster"
        },
        clientName: {
          type: "string",
          description: "Client name to add or remove (if action requires it)"
        }
      },
      required: ["classId", "action"]
    }
  },
  {
    name: "take_attendance",
    description: "Mark attendance for a group class - track who showed up, who was absent, who was late",
    input_schema: {
      type: "object",
      properties: {
        classId: {
          type: "string",
          description: "Class/session ID"
        },
        presentClients: {
          type: "array",
          items: { type: "string" },
          description: "Names of clients who attended"
        },
        absentClients: {
          type: "array",
          items: { type: "string" },
          description: "Names of clients who didn't show (optional)"
        },
        lateClients: {
          type: "array",
          items: { type: "string" },
          description: "Names of clients who arrived late (optional)"
        },
        notes: {
          type: "string",
          description: "Any notes about the class"
        }
      },
      required: ["classId", "presentClients"]
    }
  },
  {
    name: "message_class_participants",
    description: "Send a message to all participants of a specific class (updates, reminders, cancellations)",
    input_schema: {
      type: "object",
      properties: {
        classId: {
          type: "string",
          description: "Class/session ID to message"
        },
        message: {
          type: "string",
          description: "Message to send to all participants"
        },
        channel: {
          type: "string",
          enum: ["email", "sms", "whatsapp"],
          description: "Communication channel (default: email)"
        },
        includeWaitlist: {
          type: "boolean",
          description: "Also message waitlisted clients? (default: false)"
        }
      },
      required: ["classId", "message"]
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
  // 📱 SMS/TEXT MESSAGING FUNCTIONS (NEW!)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "send_sms",
    description: "Send an SMS/text message to a client's phone number",
    input_schema: {
      type: "object",
      properties: {
        clientName: {
          type: "string",
          description: "Client's name (we'll look up their phone number)"
        },
        phoneNumber: {
          type: "string",
          description: "Client's phone number (if known, format: +1234567890)"
        },
        message: {
          type: "string",
          description: "The text message to send"
        }
      },
      required: ["message"]
    }
  },
  {
    name: "send_whatsapp",
    description: "Send a WhatsApp message to a client (FREE messaging, supports images/videos/voice)",
    input_schema: {
      type: "object",
      properties: {
        clientName: {
          type: "string",
          description: "Client's name (we'll look up their phone number)"
        },
        phoneNumber: {
          type: "string",
          description: "Client's WhatsApp phone number (if known, format: +1234567890)"
        },
        message: {
          type: "string",
          description: "The message to send"
        },
        mediaUrl: {
          type: "string",
          description: "URL of image/video to send (optional)"
        }
      },
      required: ["message"]
    }
  },
  {
    name: "send_bulk_sms",
    description: "Send SMS/text messages to multiple clients at once. Great for announcements, reminders, or group updates.",
    input_schema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          enum: ["all", "active", "inactive", "unpaid", "specific"],
          description: "Which clients to message: 'all' (everyone), 'active' (active clients), 'inactive' (inactive clients), 'unpaid' (clients with unpaid invoices), 'specific' (specific list)"
        },
        clientNames: {
          type: "array",
          items: { type: "string" },
          description: "Specific client names (only if filter is 'specific'). Example: ['John Smith', 'Jane Doe']"
        },
        message: {
          type: "string",
          description: "The message to send to all recipients"
        },
        personalizeWithName: {
          type: "boolean",
          description: "If true, adds 'Hi [Name],' to the start of each message (default: true)"
        }
      },
      required: ["filter", "message"]
    }
  },
  {
    name: "send_bulk_whatsapp",
    description: "Send WhatsApp messages to multiple clients at once (FREE!). Perfect for announcements, photos, videos, or voice messages to groups.",
    input_schema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          enum: ["all", "active", "inactive", "unpaid", "specific"],
          description: "Which clients to message: 'all' (everyone), 'active' (active clients), 'inactive' (inactive clients), 'unpaid' (clients with unpaid invoices), 'specific' (specific list)"
        },
        clientNames: {
          type: "array",
          items: { type: "string" },
          description: "Specific client names (only if filter is 'specific'). Example: ['John Smith', 'Jane Doe']"
        },
        message: {
          type: "string",
          description: "The message to send to all recipients"
        },
        mediaUrl: {
          type: "string",
          description: "URL of image/video/audio to send with the message (optional)"
        },
        personalizeWithName: {
          type: "boolean",
          description: "If true, adds 'Hi [Name],' to the start of each message (default: true)"
        }
      },
      required: ["filter", "message"]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 🍎 NUTRITION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "create_meal_plan",
    description: "Create a personalized meal plan for a client based on their goals, dietary preferences, and activity level",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        },
        goal: {
          type: "string",
          enum: ["muscle_gain", "fat_loss", "maintenance", "performance", "general_health"],
          description: "Primary nutrition goal"
        },
        duration: {
          type: "number",
          description: "Plan duration in weeks (default: 4)"
        },
        dietaryRestrictions: {
          type: "array",
          items: { type: "string" },
          description: "Dietary restrictions (vegetarian, vegan, gluten-free, dairy-free, etc.)"
        },
        allergies: {
          type: "array",
          items: { type: "string" },
          description: "Food allergies"
        },
        mealsPerDay: {
          type: "number",
          description: "Number of meals per day (default: 3)"
        },
        preferences: {
          type: "string",
          description: "Any food preferences or dislikes"
        }
      },
      required: ["clientId", "goal"]
    }
  },
  {
    name: "calculate_macros",
    description: "Calculate personalized macronutrient targets (protein, carbs, fats) for a client",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        },
        weight: {
          type: "number",
          description: "Current body weight in lbs or kg"
        },
        heightFeet: {
          type: "number",
          description: "Height in feet (e.g., 5)"
        },
        heightInches: {
          type: "number",
          description: "Height in inches (e.g., 10)"
        },
        age: {
          type: "number",
          description: "Age in years"
        },
        sex: {
          type: "string",
          enum: ["male", "female"],
          description: "Biological sex"
        },
        activityLevel: {
          type: "string",
          enum: ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"],
          description: "Activity level: sedentary (1-2 days/week), lightly active (3-4), moderately (4-5), very (6-7), extremely (2x/day)"
        },
        goal: {
          type: "string",
          enum: ["muscle_gain", "fat_loss", "maintenance"],
          description: "Nutrition goal"
        }
      },
      required: ["clientId", "weight", "age", "sex", "activityLevel", "goal"]
    }
  },
  {
    name: "get_nutrition_advice",
    description: "Get evidence-based nutrition advice for specific situations (pre-workout, post-workout, competition prep, recovery, etc.)",
    input_schema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: ["pre_workout", "post_workout", "hydration", "supplements", "meal_timing", "competition_prep", "recovery", "weight_management", "energy_levels"],
          description: "Nutrition topic to get advice on"
        },
        clientContext: {
          type: "string",
          description: "Any relevant client context (sport, goals, current situation)"
        },
        sport: {
          type: "string",
          description: "Client's sport or activity (optional)"
        }
      },
      required: ["topic"]
    }
  },
  {
    name: "track_nutrition_progress",
    description: "Track and analyze a client's nutrition progress, adherence, and make adjustments",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        },
        currentWeight: {
          type: "number",
          description: "Current weight"
        },
        weeklyChange: {
          type: "number",
          description: "Weight change this week (positive = gain, negative = loss)"
        },
        adherence: {
          type: "number",
          description: "Adherence percentage (0-100)"
        },
        energyLevels: {
          type: "string",
          enum: ["very_low", "low", "normal", "high", "very_high"],
          description: "Client's energy levels"
        },
        feedback: {
          type: "string",
          description: "Client's feedback or concerns"
        }
      },
      required: ["clientId"]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FORM & TECHNIQUE ANALYSIS FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    name: "analyze_form_video",
    description: "Analyze a client's exercise form or technique from a video URL and provide detailed corrections",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        },
        videoUrl: {
          type: "string",
          description: "URL of the video to analyze (YouTube, Vimeo, or direct video link)"
        },
        exercise: {
          type: "string",
          description: "Type of exercise or movement being performed (e.g., squat, deadlift, tennis serve, basketball shot)"
        },
        focusAreas: {
          type: "array",
          items: { type: "string" },
          description: "Specific areas to focus on (optional): posture, alignment, timing, power generation, etc."
        },
        clientInjuryHistory: {
          type: "string",
          description: "Any relevant injury history to consider"
        }
      },
      required: ["clientId", "videoUrl", "exercise"]
    }
  },
  {
    name: "give_technique_corrections",
    description: "Provide specific technique corrections and cues for an exercise or sport skill",
    input_schema: {
      type: "object",
      properties: {
        exercise: {
          type: "string",
          description: "Exercise or skill name (e.g., 'squat', 'tennis serve', 'basketball free throw')"
        },
        observedIssues: {
          type: "array",
          items: { type: "string" },
          description: "List of issues observed (e.g., 'knees caving in', 'rounded back', 'late racket preparation')"
        },
        clientLevel: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced"],
          description: "Client's skill level"
        },
        sport: {
          type: "string",
          description: "Sport/activity context (optional)"
        }
      },
      required: ["exercise", "observedIssues"]
    }
  },
  {
    name: "assess_movement_patterns",
    description: "Assess overall movement patterns and identify dysfunction, compensation, or injury risk",
    input_schema: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "Client ID or name"
        },
        assessmentType: {
          type: "string",
          enum: ["functional_movement_screen", "overhead_squat", "single_leg", "gait_analysis", "sport_specific"],
          description: "Type of movement assessment"
        },
        observations: {
          type: "string",
          description: "Describe what you observed during the assessment"
        },
        painPoints: {
          type: "array",
          items: { type: "string" },
          description: "Any areas of pain or discomfort"
        },
        goals: {
          type: "string",
          description: "Client's goals or sport requirements"
        }
      },
      required: ["clientId", "assessmentType", "observations"]
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

