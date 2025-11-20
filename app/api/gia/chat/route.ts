/**
 * Gia Chatbot API
 * Powered by Claude (Anthropic)
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

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
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Anthropic API key not configured',
          message: "Hi! I'm Gia, your AI assistant. Please add your Anthropic API key to enable me." 
        },
        { status: 503 }
      )
    }

    // Build conversation history for Claude
    const messages: Anthropic.MessageParam[] = []
    
    // Add previous messages from history (excluding the welcome message)
    if (history && history.length > 1) {
      history.slice(1).forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })
      })
    }
    
    // Add current message
    messages.push({
      role: 'user',
      content: message,
    })

    // System prompt
    const systemPrompt = `You are Gia, an AI assistant for sports instructors, coaches, and wellness professionals on the GoodRunss platform. 

You help sports & wellness professionals:
- Generate session plans for any sport or wellness activity (pickleball, tennis, golf, yoga, pilates, basketball, etc.)
- Manage their clients and schedules  
- Answer questions about their business
- Provide coaching tips and best practices
- Create marketing content

Be friendly, professional, and encouraging. Keep responses concise but helpful. When instructors ask you to create session plans or help with specific clients, offer to help and guide them through what information you need.

You have access to their dashboard data including clients, schedules, payments, and session plans.`

    // Generate response using Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({
      success: true,
      message: text,
    })
  } catch (error: any) {
    console.error('Gia chat error:', error)
    
    // Check for specific Anthropic API errors
    if (error?.status === 401) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Anthropic API key',
          message: "Hi! My AI brain needs to be configured. Please check that your Anthropic API key is valid in Vercel environment variables." 
        },
        { status: 503 }
      )
    }
    
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


