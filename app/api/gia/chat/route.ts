/**
 * Gia Chatbot API
 * Powered by Google Gemini
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini API key not configured',
          message: "Hi! I'm Gia, your AI assistant. To activate me, please add your Google Gemini API key to your Vercel environment variables. Get a free key at https://makersuite.google.com/app/apikey" 
        },
        { status: 503 }
      )
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    // Build conversation history for context
    const conversationHistory = history
      ?.slice(0, -1) // Exclude the current message
      ?.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Gia'}: ${msg.content}`)
      ?.join('\n') || ''

    // System prompt
    const systemPrompt = `You are Gia, an AI assistant for sports instructors, coaches, and wellness professionals on the GoodRunss platform. 

You help sports & wellness professionals:
- Generate session plans for any sport or wellness activity (pickleball, tennis, golf, yoga, pilates, basketball, etc.)
- Manage their clients and schedules  
- Answer questions about their business
- Provide coaching tips and best practices
- Create marketing content

Be friendly, professional, and encouraging. Keep responses concise but helpful. When instructors ask you to create session plans or help with specific clients, offer to help and guide them through what information you need.

Previous conversation:
${conversationHistory}

User's current message: ${message}

Respond as Gia:`

    // Generate response
    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      success: true,
      message: text,
    })
  } catch (error) {
    console.error('Gia chat error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process message',
        message: "I'm having trouble thinking right now. Please try again in a moment!" 
      },
      { status: 500 }
    )
  }
}


