/**
 * GIA Voice Command API
 * POST /api/gia/voice
 * 
 * Processes voice commands and converts them to GIA chat messages
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transcript, confidence, wakeWordDetected } = body;

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: "Transcript is required" },
        { status: 400 }
      );
    }

    // Log voice command
    console.log(`🎤 Voice command from ${userId}: "${transcript}" (${(confidence * 100).toFixed(1)}% confidence)`);

    // Parse voice command
    const parsedCommand = parseVoiceCommand(transcript);

    // Convert to text command for GIA
    const textCommand = transcript;

    return NextResponse.json({
      success: true,
      data: {
        transcript,
        confidence,
        wakeWordDetected,
        parsedIntent: parsedCommand.intent,
        parsedParams: parsedCommand.params,
        textCommand,
        message: "Voice command received and processed"
      }
    });

  } catch (error: any) {
    console.error("❌ Error processing voice command:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process voice command"
      },
      { status: 500 }
    );
  }
}

/**
 * Parse voice command to extract intent and parameters
 */
function parseVoiceCommand(transcript: string): {
  intent: string | null;
  params: Record<string, any>;
} {
  const lower = transcript.toLowerCase().trim();

  // Intent patterns
  const patterns = [
    // Calendar/Schedule
    { pattern: /(?:what'?s|show|tell me) (?:on )?my schedule(?: today| tomorrow)?/i, intent: 'getSchedule' },
    { pattern: /(?:add|create|schedule) (?:a )?(?:session|booking|appointment)/i, intent: 'createBooking' },
    { pattern: /(?:cancel|delete|remove) (?:the )?(?:session|booking|appointment)/i, intent: 'cancelBooking' },
    
    // Clients
    { pattern: /(?:show|list|get) (?:my )?clients?/i, intent: 'listClients' },
    
    // Payments
    { pattern: /(?:how much|what) (?:did I|have I) (?:make|made|earn|earned)/i, intent: 'getRevenue' },
    { pattern: /(?:show|get|list) (?:my )?(?:payments|earnings|revenue)/i, intent: 'listPayments' },
    
    // Messages
    { pattern: /(?:send|write) (?:a )?message/i, intent: 'sendMessage' },
    { pattern: /(?:show|check|get) (?:my )?messages/i, intent: 'getMessages' },
    
    // Analytics
    { pattern: /(?:show|get) (?:my )?(?:analytics|stats|statistics)/i, intent: 'getAnalytics' },
  ];

  // Find matching pattern
  for (const { pattern, intent } of patterns) {
    if (pattern.test(lower)) {
      const params = extractParams(lower, intent);
      return { intent, params };
    }
  }

  // No match - general query
  return { intent: 'generalQuery', params: {} };
}

/**
 * Extract parameters from voice command
 */
function extractParams(text: string, intent: string): Record<string, any> {
  const params: Record<string, any> = {};

  // Time-based parameters
  if (text.includes('today')) params.timeframe = 'today';
  if (text.includes('tomorrow')) params.timeframe = 'tomorrow';
  if (text.includes('this week')) params.timeframe = 'week';
  if (text.includes('this month')) params.timeframe = 'month';
  if (text.includes('this year')) params.timeframe = 'year';

  // Extract names (basic)
  const nameMatch = text.match(/(?:with|for|to) ([A-Z][a-z]+ ?[A-Z]?[a-z]*)/);
  if (nameMatch) params.name = nameMatch[1];

  // Extract times
  const timeMatch = text.match(/(?:at |@)(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (timeMatch) params.time = timeMatch[1];

  // Extract amounts
  const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
  if (amountMatch && intent.includes('payment')) {
    params.amount = parseFloat(amountMatch[1]);
  }

  return params;
}
