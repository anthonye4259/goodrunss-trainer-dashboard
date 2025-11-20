/**
 * Test endpoint to verify Anthropic API configuration
 * DELETE THIS FILE AFTER TESTING
 */

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'ANTHROPIC_API_KEY not found in environment variables',
        keyPresent: false,
      })
    }

    // Verify key format
    const keyInfo = {
      keyPresent: true,
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10) + '...',
      startsWithSkAnt: apiKey.startsWith('sk-ant-'),
    }

    // Try to initialize Anthropic client
    const anthropic = new Anthropic({ apiKey })

    // Try a simple API call
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say "OK"' }],
      })

      return NextResponse.json({
        status: 'success',
        message: 'Anthropic API is working correctly!',
        ...keyInfo,
        apiResponse: response.content[0].type === 'text' ? response.content[0].text : 'OK',
      })
    } catch (apiError: any) {
      return NextResponse.json({
        status: 'api_error',
        message: 'API key is present but API call failed',
        ...keyInfo,
        error: apiError.message,
        errorStatus: apiError.status,
        errorType: apiError.type,
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Anthropic API',
      error: error.message,
    })
  }
}

