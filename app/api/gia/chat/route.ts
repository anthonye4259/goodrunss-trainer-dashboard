import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, files } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get last user message
    const lastUserMessage = messages[messages.length - 1]
    
    // Build file context
    let fileContext = ''
    if (files && files.length > 0) {
      fileContext = `\n\n**Attached Files:**\n${files.map((f: any) => `- ${f.name} (${f.type})`).join('\n')}\n\n`
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are GIA (Goodrunss Intelligence Assistant), an expert AI assistant for fitness trainers and wellness professionals. Be helpful, professional, and concise.'
        },
        {
          role: 'user',
          content: `${lastUserMessage.content}${fileContext}`
        }
      ],
      max_tokens: 1024,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'No response'
      
    return NextResponse.json({
      success: true,
      response: aiResponse,
    })
  } catch (error: any) {
    console.error('[GIA Chat] OpenAI error:', error)
    console.error('[GIA Chat] Error details:', {
      message: error.message,
      stack: error.stack,
      hasApiKey: !!process.env.OPENAI_API_KEY,
    })
    
    return NextResponse.json({
      success: true,
      response: `I'm having trouble connecting right now. 🤖\n\nError: ${error.message}\n\nPlease check that OPENAI_API_KEY is set in Vercel.`,
    })
  }
}
