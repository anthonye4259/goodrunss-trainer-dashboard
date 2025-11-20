/**
 * Test endpoint to verify Google Gemini API configuration
 * DELETE THIS FILE AFTER TESTING
 */

import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'GOOGLE_GEMINI_API_KEY not found in environment variables',
        keyPresent: false,
        instructions: 'Get a free API key at https://aistudio.google.com/app/apikey',
      })
    }

    // Verify key format
    const keyInfo = {
      keyPresent: true,
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10) + '...',
    }

    // Try to initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)

    // Try a simple API call with gemini-1.0-pro
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' })
      const result = await model.generateContent('Say "OK"')
      const response = result.response.text()

      return NextResponse.json({
        status: 'success',
        message: 'Google Gemini API is working correctly!',
        ...keyInfo,
        apiResponse: response,
        model: 'gemini-1.0-pro',
      })
    } catch (apiError: any) {
      return NextResponse.json({
        status: 'api_error',
        message: 'API key is present but API call failed',
        ...keyInfo,
        error: apiError.message,
        instructions: 'Get a new API key at https://aistudio.google.com/app/apikey',
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Google Gemini API',
      error: error.message,
    })
  }
}

