import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // List all available models for this API key
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    )

    const data = await response.json()

    return NextResponse.json({
      apiKeyExists: !!process.env.GEMINI_API_KEY,
      models: data.models?.map((m: any) => ({
        name: m.name,
        displayName: m.displayName,
        supportedMethods: m.supportedGenerationMethods,
      })) || [],
      fullResponse: data,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    })
  }
}

