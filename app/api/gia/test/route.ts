/**
 * Test endpoint to verify Google Gemini API configuration
 * Using direct REST API (v1 stable endpoint)
 */

import { NextResponse } from 'next/server'

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

    // Try a simple API call using v1 stable endpoint with gemini-pro
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Say "OK"'
              }]
            }]
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API Error: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'

      return NextResponse.json({
        status: 'success',
        message: 'Google Gemini API is working correctly!',
        ...keyInfo,
        apiResponse: text,
        model: 'gemini-pro (v1 stable)',
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

