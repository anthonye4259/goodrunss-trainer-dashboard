import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

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

    // Initialize Anthropic (ORIGINAL WORKING VERSION)
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Get last user message
    const lastUserMessage = messages[messages.length - 1]
    
    // Build file context
    let fileContext = ''
    if (files && files.length > 0) {
      fileContext = `\n\n**Attached Files:**\n${files.map((f: any) => `- ${f.name} (${f.type})`).join('\n')}\n\n`
    }

    // System prompt
    const systemPrompt = `You are GIA (Goodrunss Intelligence Assistant), an expert AI assistant for fitness trainers and wellness professionals. Be helpful, professional, and concise.`

    // Call Claude (ORIGINAL WORKING VERSION)
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\n${lastUserMessage.content}${fileContext}`
      }]
    })

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : ''
      
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
