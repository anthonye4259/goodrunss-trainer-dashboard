import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/twilio/webhook
 * Receives incoming SMS messages from Twilio
 * GIA auto-responds to client messages
 */
export async function POST(req: NextRequest) {
  try {
    // Parse Twilio webhook data
    const formData = await req.formData();
    
    const from = formData.get('From') as string; // Client's phone number
    const to = formData.get('To') as string; // Your Twilio number
    const body = formData.get('Body') as string; // Message content
    const messageSid = formData.get('MessageSid') as string;

    console.log('📱 Incoming SMS:', { from, to, body });

    // Find which trainer owns this Twilio number
    // For now, we'll need to store trainer<->phone mapping
    // TODO: Add a settings table for trainer Twilio numbers
    
    // Find client by phone number
    const client = await prisma.client.findFirst({
      where: {
        phone: {
          contains: from.replace(/\D/g, '').slice(-10) // Last 10 digits
        }
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            specialties: true
          }
        }
      }
    });

    if (!client) {
      // Unknown number - polite response
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Hi! I don't have your number in my system yet. Please reach out to your trainer to get set up!</Message>
</Response>`,
        { 
          status: 200,
          headers: { 'Content-Type': 'text/xml' }
        }
      );
    }

    // Log the incoming message
    await prisma.message.create({
      data: {
        senderId: client.id,
        receiverId: client.trainerId,
        content: `[SMS from ${from}] ${body}`,
        messageType: 'TEXT',
      }
    });

    // Use GIA to generate intelligent response
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system: `You are GIA, an AI assistant for ${client.trainer?.name || 'a fitness trainer'}.

You're responding to an SMS from ${client.name}, one of the trainer's clients.

IMPORTANT GUIDELINES:
- Be helpful, friendly, and professional
- Keep responses SHORT (under 160 characters if possible - it's SMS!)
- If asked about scheduling, say you'll let the trainer know
- If urgent, say the trainer will respond soon
- Never make promises you can't keep
- Use emojis sparingly (1-2 max)

Common scenarios and responses:
- "Running late" → "No problem! I'll let [trainer] know. See you soon!"
- "Can I reschedule?" → "Sure! Let me check and [trainer] will get back to you ASAP"
- "Cancel session" → "Got it. [trainer] will confirm the cancellation shortly."
- Questions about workout → Give helpful answer if you know, otherwise defer to trainer
`,
      messages: [{
        role: "user",
        content: `Client ${client.name} just texted: "${body}"\n\nGenerate a helpful SMS response (keep it under 160 characters).`
      }]
    });

    const aiResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : "Got your message! The trainer will respond soon.";

    // Log GIA's response
    await prisma.message.create({
      data: {
        senderId: client.trainerId,
        receiverId: client.id,
        content: `[GIA Auto-Reply] ${aiResponse}`,
        messageType: 'TEXT',
      }
    });

    // Send TwiML response (Twilio will send this back to client)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${aiResponse.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>
</Response>`,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      }
    );

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    
    // Send generic response if something fails
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks for your message! Your trainer will respond soon.</Message>
</Response>`,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      }
    );
  }
}

// Handle GET requests (for verification)
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: "Twilio webhook endpoint active",
    message: "Configure this URL in your Twilio console"
  });
}
