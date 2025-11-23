import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

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

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userPrompt = lastMessage.content

    // Build context from files if provided
    let fileContext = ''
    if (files && files.length > 0) {
      fileContext = `\n\n**Attached Files:**\n${files.map((f: any) => `- ${f.name} (${f.type})`).join('\n')}\n\n`
    }

    // Build conversation history for context
    const conversationHistory = messages
      .slice(-5) // Last 5 messages for context
      .map((m: any) => `${m.role === 'user' ? 'User' : 'GIA'}: ${m.content}`)
      .join('\n')

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are GIA (Goodrunss Intelligence Assistant), an expert AI assistant for fitness trainers. You help trainers:

- Create personalized workout plans
- Analyze client data and progress
- Generate marketing content for social media
- Answer training and nutrition questions
- Review uploaded documents (workout logs, PDFs, images, CSVs)

Be helpful, professional, and concise. Format responses with bullet points and clear sections. When analyzing uploaded files, reference them directly.`,
          },
          ...messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content + (m.role === 'user' && fileContext ? fileContext : ''),
          })),
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      console.error('[GIA Chat] OpenAI error:', error)
      throw new Error('OpenAI request failed')
    }

    const data = await openaiResponse.json()
    const aiResponse = data.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: aiResponse,
    })
  } catch (error: any) {
    console.error('[GIA Chat] Error:', error)
    
    // Fallback response if API fails
    return NextResponse.json({
      success: true,
      response: `I'm having trouble connecting to my AI brain right now. 🤖\n\nIn the meantime, here are some things I can help you with once I'm back:\n\n• Create workout plans\n• Analyze client progress\n• Generate social media content\n• Answer training questions\n\nPlease try again in a moment!`,
    })
  }
}
