/**
 * Gia Chatbot API
 * Powered by Google Gemini (using v1 stable REST API)
 */

import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are Gia, an AI assistant for sports instructors, coaches, and wellness professionals on the GoodRunss platform. 

You help sports & wellness professionals:
- Generate session plans for any sport or wellness activity (pickleball, tennis, golf, yoga, pilates, basketball, etc.)
- Manage their clients and schedules  
- Answer questions about their business
- Provide coaching tips and best practices
- Create marketing content

Be friendly, professional, and encouraging. Keep responses concise but helpful (2-3 paragraphs max). When instructors ask you to create session plans or help with specific clients, offer to help and guide them through what information you need.

You have access to their dashboard data including clients, schedules, payments, and session plans.`

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
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      console.error('GOOGLE_GEMINI_API_KEY not found in environment variables')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Google Gemini API key not configured',
          message: "Hi! I'm Gia, your AI assistant. Please add GOOGLE_GEMINI_API_KEY to Vercel environment variables. Get one free at https://aistudio.google.com/app/apikey" 
        },
        { status: 503 }
      )
    }

    // Build conversation history for Gemini REST API
    const contents: any[] = []
    
    // Add system prompt as first user message, then a model acknowledgment
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: "Understood! I'm Gia, ready to help sports and wellness professionals with their training business." }]
    })
    
    // Add previous messages from history (excluding the welcome message)
    if (history && history.length > 1) {
      history.slice(1).forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })
      })
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // Call Gemini API using v1 stable endpoint with gemini-2.5-flash (newest model)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', errorData)
      throw new Error(`Gemini API Error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('No response text from Gemini API')
    }

    return NextResponse.json({
      success: true,
      message: text,
    })
  } catch (error: any) {
    console.error('Gia chat error:', error)
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
    })
    
    // Check for specific Gemini API errors
    if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('API key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Google Gemini API key',
          message: "Hi! My AI brain can't authenticate. Please get a free API key at https://aistudio.google.com/app/apikey and add it to Vercel as GOOGLE_GEMINI_API_KEY" 
        },
        { status: 503 }
      )
    }

    if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          message: "I'm getting too many requests right now. Please wait a moment and try again!" 
        },
        { status: 429 }
      )
    }
    
    // Return actual error message in development for debugging
    const errorMsg = process.env.NODE_ENV === 'development' 
      ? `Error: ${error?.message || 'Unknown error'}` 
      : "I'm having trouble thinking right now. Please try again in a moment!"
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process message',
        message: errorMsg,
      },
      { status: 500 }
    )
  }
}


