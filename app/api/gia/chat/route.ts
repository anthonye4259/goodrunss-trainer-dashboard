import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    // Initialize Gemini with NEW API key that supports latest models
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
    })

    // Build context from files if provided
    let fileContext = ''
    if (files && files.length > 0) {
      fileContext = `\n\n**Attached Files:**\n${files.map((f: any) => `- ${f.name} (${f.type})`).join('\n')}\n\n`
    }

    // System prompt
    const systemPrompt = `You are GIA (Goodrunss Intelligence Assistant), an expert AI assistant for fitness trainers and wellness professionals. You help with:

- Creating personalized workout plans and training programs
- Analyzing client data, progress, and performance
- Generating marketing content for social media
- Answering training, nutrition, and wellness questions
- Reviewing uploaded documents (workout logs, PDFs, images, CSVs)
- Supporting ALL types of trainers: personal trainers, sports coaches (pickleball, basketball, tennis, golf), yoga instructors, pilates instructors, barre instructors, and wellness professionals

Be helpful, professional, and concise. Format responses with bullet points and clear sections. When analyzing uploaded files, reference them directly.`

    // Build conversation history for Gemini (must start with 'user')
    const conversationHistory = messages
      .slice(-5) // Last 5 messages for context
      .filter((m: any) => m.role !== 'system') // Remove system messages
      .map((m: any) => {
        const role = m.role === 'assistant' ? 'model' : 'user'
        const content = m.content
        return { role, parts: [{ text: content }] }
      })

    // Ensure history starts with 'user' role
    if (conversationHistory.length > 0 && conversationHistory[0].role !== 'user') {
      conversationHistory.shift() // Remove first message if it's not a user message
    }

    // Get last user message
    const lastUserMessage = messages[messages.length - 1]

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All but last message
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    })

    // Send the last message with system prompt context
    const result = await chat.sendMessage(
      `${systemPrompt}\n\n${lastUserMessage.content}${fileContext}`
    )
    
    const response = await result.response
    const aiResponse = response.text()

    return NextResponse.json({
      success: true,
      response: aiResponse,
    })
  } catch (error: any) {
    console.error('[GIA Chat] Gemini error:', error)
    console.error('[GIA Chat] Error details:', {
      message: error.message,
      stack: error.stack,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    })
    
    // Fallback response if API fails
    return NextResponse.json({
      success: true,
      response: `I'm having trouble connecting to my AI brain right now. 🤖\n\nError: ${error.message}\n\nIn the meantime, here are some things I can help you with once I'm back:\n\n• Create workout plans\n• Analyze client progress\n• Generate social media content\n• Answer training questions\n• Review uploaded files\n\nPlease try again in a moment!`,
    })
  }
}
