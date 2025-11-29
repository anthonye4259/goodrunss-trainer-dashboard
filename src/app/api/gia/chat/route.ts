import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { giaFunctions } from "@/lib/gia-functions";
import { executeGIAFunction, parseRelativeDate, parseTime } from "@/lib/gia-executor";
import { loadMemories, formatMemoriesForPrompt, extractAndSaveMemories } from "@/lib/gia-memory";
import { getExpertSystemPrompt } from "@/lib/gia-expert-prompts";

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

    // 🧠 LOAD MEMORIES - GIA remembers everything about you!
    const memories = await loadMemories(userId, 30);
    const memoryContext = formatMemoriesForPrompt(memories);

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

    // 🧠 USE EXPERT SYSTEM PROMPT - Makes GIA a PhD-level expert!
    const systemPrompt = getExpertSystemPrompt(
      primarySpecialty,
      trainer?.name || "the trainer",
      memoryContext
    );

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

    // 🧠 EXTRACT & SAVE MEMORIES - Learn from this conversation!
    try {
      await extractAndSaveMemories(userId, message, finalResponse);
    } catch (memoryError) {
      console.error("Error saving memories:", memoryError);
      // Don't fail the request if memory saving fails
    }

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
          aiMessages: {
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
        aiMessages: {
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

