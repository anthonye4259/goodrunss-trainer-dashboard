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
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
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

    // Build conversation history for Gemini
    const geminiHistory: any[] = []
    
    // Add previous messages from history (excluding the welcome message)
    if (history && history.length > 1) {
      history.slice(1).forEach((msg: any) => {
        geminiHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })
      })
    }

    // System prompt - prepend to conversation
    const systemPrompt = `You are Gia, an AI assistant for sports instructors, coaches, and wellness professionals on the GoodRunss platform. 

You help sports & wellness professionals:
- Generate session plans for any sport or wellness activity (pickleball, tennis, golf, yoga, pilates, basketball, etc.)
- Manage their clients and schedules  
- Answer questions about their business
- Provide coaching tips and best practices
- Create marketing content

Be friendly, professional, and encouraging. Keep responses concise but helpful (2-3 paragraphs max). When instructors ask you to create session plans or help with specific clients, offer to help and guide them through what information you need.

You have access to their dashboard data including clients, schedules, payments, and session plans.`

    // Generate response using Gemini Pro
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
    })

    // Prepend system prompt to first user message
    const fullMessage = geminiHistory.length === 0 
      ? `${systemPrompt}\n\nUser: ${message}`
      : message

    const chat = model.startChat({
      history: geminiHistory,
    })

    const result = await chat.sendMessage(fullMessage)
    const text = result.response.text()

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


