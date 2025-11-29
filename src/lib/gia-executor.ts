// GIA Function Executor - Routes function calls to action handlers

import {
  createCalendarEventAction,
  getScheduleAction,
  findAvailableSlotsAction,
  cancelEventAction,
  createClientAction,
  searchClientsAction,
  getClientDetailsAction,
  getClientListAction,
  getRevenueStatsAction,
  createInvoiceAction,
  sendMessageAction,
  sendSmsAction,
  sendWhatsAppAction,
  generateWorkoutPlanAction,
  getPersonaEarningsAction
} from "./gia-actions";

export async function executeGIAFunction(
  functionName: string,
  params: any,
  trainerId: string
) {
  // Add trainerId to all params
  const paramsWithTrainer = { ...params, trainerId };

  try {
    switch (functionName) {
      // Calendar functions
      case "create_calendar_event":
        return await createCalendarEventAction(paramsWithTrainer);
      
      case "get_schedule":
        return await getScheduleAction(paramsWithTrainer);
      
      case "find_available_slots":
        return await findAvailableSlotsAction(paramsWithTrainer);
      
      case "cancel_event":
        return await cancelEventAction(paramsWithTrainer);
      
      case "update_calendar_event":
        // TODO: Implement update
        return {
          success: false,
          error: "Update calendar event not yet implemented"
        };

      // Client functions
      case "create_client":
        return await createClientAction(paramsWithTrainer);
      
      case "search_clients":
        return await searchClientsAction(paramsWithTrainer);
      
      case "get_client_details":
        return await getClientDetailsAction(paramsWithTrainer);
      
      case "get_client_list":
        return await getClientListAction(paramsWithTrainer);

      // Payment functions
      case "create_invoice":
        return await createInvoiceAction(paramsWithTrainer);
      
      case "get_revenue_stats":
        return await getRevenueStatsAction(paramsWithTrainer);
      
      case "get_pending_payments":
        // TODO: Implement
        return {
          success: false,
          error: "Get pending payments not yet implemented"
        };
      
      case "mark_payment_received":
        // TODO: Implement
        return {
          success: false,
          error: "Mark payment received not yet implemented"
        };

      // Messaging functions
      case "send_message":
        return await sendMessageAction(paramsWithTrainer);
      
      case "send_sms":
        return await sendSmsAction(paramsWithTrainer);
      
      case "send_whatsapp":
        return await sendWhatsAppAction(paramsWithTrainer);
      
      case "send_bulk_message":
        // TODO: Implement
        return {
          success: false,
          error: "Send bulk message not yet implemented"
        };
      
      case "get_recent_messages":
        // TODO: Implement
        return {
          success: false,
          error: "Get recent messages not yet implemented"
        };

      // Workout functions
      case "generate_workout_plan":
        return await generateWorkoutPlanAction(paramsWithTrainer);
      
      case "send_workout_plan":
        // TODO: Implement
        return {
          success: false,
          error: "Send workout plan not yet implemented"
        };

      // Analytics functions
      case "get_session_stats":
        // TODO: Implement
        return {
          success: false,
          error: "Get session stats not yet implemented"
        };
      
      case "get_client_stats":
        // TODO: Implement
        return {
          success: false,
          error: "Get client stats not yet implemented"
        };
      
      case "get_performance_summary":
        // TODO: Implement
        return {
          success: false,
          error: "Get performance summary not yet implemented"
        };
      
      case "generate_report":
        // TODO: Implement
        return {
          success: false,
          error: "Generate report not yet implemented"
        };

      // AI Persona functions
      case "get_persona_earnings":
        return await getPersonaEarningsAction(paramsWithTrainer);
      
      case "get_persona_stats":
        // TODO: Implement
        return {
          success: false,
          error: "Get persona stats not yet implemented"
        };

      default:
        return {
          success: false,
          error: `Unknown function: ${functionName}`
        };
    }
  } catch (error: any) {
    console.error(`Error executing function ${functionName}:`, error);
    return {
      success: false,
      error: `Failed to execute ${functionName}: ${error.message}`
    };
  }
}

// Helper to parse relative dates ("tomorrow", "next monday", etc.)
export function parseRelativeDate(input: string): string {
  const today = new Date();
  const lower = input.toLowerCase();

  if (lower === "today") {
    return today.toISOString().split("T")[0];
  }

  if (lower === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  if (lower.includes("next")) {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = lower.replace("next", "").trim();
    const targetDay = days.indexOf(dayName);

    if (targetDay !== -1) {
      const currentDay = today.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;

      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      return nextDate.toISOString().split("T")[0];
    }
  }

  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  // Default to today
  return today.toISOString().split("T")[0];
}

// Helper to parse time formats
export function parseTime(input: string): string {
  // Already in HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(input)) {
    const [hours, minutes] = input.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  // Parse "2pm", "14:00", "2:30pm", etc.
  const match = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2] || "00";
    const meridiem = match[3]?.toLowerCase();

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  return input; // Return as is if can't parse
}

