import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { giaFunctions } from "@/lib/gia-functions";
import { executeGIAFunction, parseRelativeDate, parseTime } from "@/lib/gia-executor";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/gia/chat
 * AI Agent conversation with function calling
 * GIA can take actions on behalf of the trainer
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aiConversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      conversation = await prisma.aiConversation.create({
        data: {
          userId,
          context: { type: "gia_agent" },
        },
      });
    }

    // Fetch trainer's specialty for context
    const trainer = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        specialties: true,
        bio: true,
        name: true,
      },
    });

    const specialties = trainer?.specialties || [];
    const primarySpecialty = specialties[0] || 'fitness';
    const specialtyList = specialties.length > 0 
      ? specialties.join(', ') 
      : 'general fitness';

    // Get conversation history (last 10 messages for context)
    const history = await prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    // Build message history for Claude
    const messages: Anthropic.Messages.MessageParam[] = [];

    // Add conversation history
    for (const msg of history) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // System prompt for GIA (specialty-aware)
    const systemPrompt = `You are GIA (Generative Intelligent Assistant), an AI agent helping a ${primarySpecialty} instructor/coach manage their business.

**TRAINER SPECIALTY CONTEXT:**
- Primary specialty: ${primarySpecialty}
- All specialties: ${specialtyList}
- You are assisting a ${primarySpecialty} professional, so all responses, workout plans, content, and suggestions should be HIGHLY SPECIFIC to ${primarySpecialty}.
${getSpecialtyGuidance(primarySpecialty)}

You are GIA (Generative Intelligent Assistant), an AI agent helping a ${primarySpecialty} instructor/coach manage their business.

You have access to various functions to help the trainer with:
- 📅 Calendar management (schedule, reschedule, cancel sessions)
- 👥 Client management (add, search, view client details)
- 💰 Payment tracking (create invoices, check revenue, track payments)
- 💬 Messaging (send messages to clients)
- 💪 Workout planning (generate AI workout plans)
- 📊 Analytics (get stats, generate reports)
- 🤖 AI Persona management (check earnings, view stats)

IMPORTANT GUIDELINES:
1. **Be conversational and friendly** - You're a helpful assistant, not a robot
2. **Confirm actions** - When taking actions, always confirm what you did
3. **Handle errors gracefully** - If something fails, explain why and suggest alternatives
4. **Parse natural language** - Convert "tomorrow", "next Monday", "2pm" to proper formats
5. **Proactive suggestions** - If you notice patterns, suggest helpful actions
6. **Multi-step workflows** - Break complex requests into steps if needed
7. **Context awareness** - Remember what was discussed earlier in the conversation

NATURAL LANGUAGE PARSING:
- "tomorrow at 2pm" → Calculate actual date and convert to 14:00
- "next Monday" → Calculate date for next Monday
- "John" → Search for client named John and use their ID
- "$75 invoice to Mike" → Find Mike's ID and create invoice

EXAMPLES OF GOOD RESPONSES:
- "✅ Done! Added tennis session with John tomorrow at 2pm. Confirmation email sent."
- "⚠️ You already have a session at that time. Would you like me to suggest alternative slots?"
- "💰 You made $1,240 this week from 18 sessions. That's 15% more than last week! 🎉"
- "Found 3 clients named John. Which one? (1) John Doe, (2) John Smith, (3) Johnny B"

Be helpful, efficient, and make the trainer's life easier! 🚀`;

    // Call Claude with function calling
    let response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemPrompt,
      messages,
      tools: giaFunctions as any[],
    });

    let finalResponse = "";
    let functionResults: any[] = [];

    // Handle function calls
    while (response.stop_reason === "tool_use") {
      const toolUseBlock = response.content.find(
        (block) => block.type === "tool_use"
      ) as Anthropic.Messages.ToolUseBlock | undefined;

      if (!toolUseBlock) break;

      console.log(`🔧 GIA calling function: ${toolUseBlock.name}`);
      console.log(`📋 Parameters:`, toolUseBlock.input);

      // Execute the function
      const result = await executeGIAFunction(
        toolUseBlock.name,
        toolUseBlock.input,
        userId
      );

      console.log(`✅ Function result:`, result);
      functionResults.push({
        function: toolUseBlock.name,
        params: toolUseBlock.input,
        result,
      });

      // Add function result to conversation
      messages.push({
        role: "assistant",
        content: response.content,
      });

      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUseBlock.id,
            content: JSON.stringify(result),
          },
        ],
      });

      // Continue conversation with function result
      response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: systemPrompt,
        messages,
        tools: giaFunctions as any[],
      });
    }

    // Extract final text response
    const textBlock = response.content.find(
      (block) => block.type === "text"
    ) as Anthropic.Messages.TextBlock | undefined;

    finalResponse = textBlock?.text || "I've completed the action.";

    // Save user message to database
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Save assistant response to database
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: finalResponse,
        metadata: functionResults.length > 0 
          ? JSON.parse(JSON.stringify({ functionCalls: functionResults }))
          : null,
      },
    });

    return NextResponse.json({
      success: true,
      response: finalResponse,
      conversationId: conversation.id,
      functionCalls: functionResults.length > 0 ? functionResults : undefined,
    });
  } catch (error: any) {
    console.error("❌ Error in GIA chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gia/chat?conversationId=xxx
 * Get conversation history
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      // Get all conversations
      const conversations = await prisma.aiConversation.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });

      return NextResponse.json({
        success: true,
        conversations,
      });
    }

    // Get specific conversation
    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

/**
 * Get specialty-specific guidance for GIA
 */
function getSpecialtyGuidance(specialty: string): string {
  const guidance: Record<string, string> = {
    basketball: `
**BASKETBALL-SPECIFIC GUIDANCE:**
- When creating workouts: focus on court drills, vertical jump training, defensive slides, fast breaks
- Use basketball terminology: "practice" not "workout", "drills" not "exercises"
- Emphasize: conditioning, agility, court awareness, game situations
- Equipment: basketball, cones, ladder, resistance bands`,
    
    pickleball: `
**PICKLEBALL-SPECIFIC GUIDANCE:**
- When creating workouts: focus on paddle technique, dinking drills, net play, court positioning
- Use pickleball terminology: "practice" not "workout", "drills" not "exercises"
- Emphasize: quick reactions, lateral movement, soft hands, strategic play
- Equipment: paddle, balls, cones, court lines`,
    
    tennis: `
**TENNIS-SPECIFIC GUIDANCE:**
- When creating workouts: focus on stroke mechanics, footwork patterns, serve technique
- Use tennis terminology: "practice" not "workout", "drills" not "exercises"
- Emphasize: court coverage, consistency, power, spin control
- Equipment: racket, balls, cones, court`,
    
    yoga: `
**YOGA-SPECIFIC GUIDANCE:**
- When creating content: focus on flow sequences, breath work (pranayama), meditation
- Use yoga terminology: "class" not "workout", "asana/pose" not "exercise", "breaths" not "reps"
- Emphasize: mindfulness, alignment, modifications, different styles (vinyasa, yin, restorative)
- Equipment: mat, blocks, straps, bolsters`,
    
    pilates: `
**PILATES-SPECIFIC GUIDANCE:**
- When creating content: focus on core stability, controlled movements, breath coordination
- Use pilates terminology: "class" not "workout", "movement" not "exercise"
- Emphasize: precision, control, breathing, reformer vs mat exercises
- Equipment: mat, reformer, magic circle, resistance bands`,
    
    barre: `
**BARRE-SPECIFIC GUIDANCE:**
- When creating content: focus on isometric holds, small pulsing movements, ballet-inspired
- Use barre terminology: "class" not "workout", "sequence" not "exercise", "pulses" not "reps"
- Emphasize: alignment, engagement, endurance, flexibility
- Equipment: barre, light weights, resistance bands, mat`,
    
    strength_training: `
**STRENGTH TRAINING-SPECIFIC GUIDANCE:**
- When creating content: focus on progressive overload, compound movements, proper form
- Use strength terminology: "workout" not "session", standard exercise names
- Emphasize: periodization, muscle groups, recovery, progressive difficulty
- Equipment: dumbbells, barbells, machines, bench`,
    
    hiit: `
**HIIT-SPECIFIC GUIDANCE:**
- When creating content: focus on high-intensity intervals, work-to-rest ratios
- Use HIIT terminology: "workout" not "session", "rounds" not "sets"
- Emphasize: intensity, metabolic conditioning, efficient calorie burn, variety
- Equipment: minimal equipment, bodyweight, kettlebells, jump rope`,
    
    crossfit: `
**CROSSFIT-SPECIFIC GUIDANCE:**
- When creating content: focus on WODs (workout of the day), functional movements
- Use CrossFit terminology: "WOD", "AMRAP", "EMOM", "movements" not "exercises"
- Emphasize: intensity, variety, Olympic lifts, gymnastics, community
- Equipment: barbell, plyometric box, pull-up bar, rings`,
  };

  const normalizedSpecialty = specialty.toLowerCase().replace(/[_\s-]+/g, '_');
  return guidance[normalizedSpecialty] || `
**GENERAL FITNESS GUIDANCE:**
- Focus on proper form, safety, and progressive difficulty
- Use standard fitness terminology
- Emphasize: consistency, recovery, balanced programming`;
}
