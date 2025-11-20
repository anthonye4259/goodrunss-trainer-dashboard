/**
 * Auto CRM Document Parser
 * Upload messy documents → AI extracts structured client data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from '@/lib/prisma'

// POST /api/gia/process-documents - Process documents with AI
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    // Process each file with Google Gemini Vision
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const extractedProfiles: any[] = []
    const extractedProgress: any[] = []
    const extractedGoals: any[] = []
    const recommendations: any[] = []

    for (const file of files) {
      try {
        // Convert file to base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')

        // Determine MIME type
        let mimeType = file.type
        if (!mimeType) {
          if (file.name.endsWith('.pdf')) mimeType = 'application/pdf'
          else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg'
          else if (file.name.endsWith('.png')) mimeType = 'image/png'
          else mimeType = 'image/jpeg' // default
        }

        // Call Gemini Vision API
        const prompt = `You are an AI assistant helping sports coaches organize their client data.

Analyze this document (screenshot, PDF, note, or image) and extract ALL client information you can find.

Extract and structure the following (use null if not found):

**CLIENT PROFILES:**
- Client name
- Age
- Email
- Phone number
- Medical history (array of conditions)
- Injuries (array)

**PROGRESS TRACKING:**
- Date of progress entry
- Metrics achieved (e.g., "bench press: 185 lbs", "mile time: 7:30")
- Observations

**GOALS:**
- Goal description
- Target date (if mentioned)
- Priority (high/medium/low)
- Category (strength/endurance/flexibility/weight_loss/sports_performance)

**NOTES:**
- Any other relevant information

Return your response as a JSON object with this exact structure:
{
  "clientProfiles": [{ "name": string, "age": number|null, "email": string|null, "phone": string|null, "medicalHistory": string[], "injuries": string[] }],
  "progressEntries": [{ "date": string (YYYY-MM-DD), "metrics": object, "observations": string }],
  "goals": [{ "description": string, "targetDate": string|null, "priority": "high"|"medium"|"low", "category": string }],
  "notes": string
}

Be thorough and extract EVERYTHING you see, even if handwritten or in a screenshot.`

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64
                    }
                  }
                ]
              }]
            })
          }
        )

        if (!geminiResponse.ok) {
          console.error('Gemini API error:', await geminiResponse.text())
          continue
        }

        const geminiData = await geminiResponse.json()
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!responseText) {
          console.log('No text response from Gemini for file:', file.name)
          continue
        }

        // Parse JSON from response (handle markdown code blocks)
        let jsonText = responseText.trim()
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.substring(7)
        }
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.substring(3)
        }
        if (jsonText.endsWith('```')) {
          jsonText = jsonText.substring(0, jsonText.length - 3)
        }
        jsonText = jsonText.trim()

        const parsed = JSON.parse(jsonText)

        // Process extracted data
        if (parsed.clientProfiles && parsed.clientProfiles.length > 0) {
          for (const profile of parsed.clientProfiles) {
            if (profile.name) {
              // Create or update client in database
              const existingClient = await prisma.clients.findFirst({
                where: {
                  trainerId: trainer.id,
                  name: profile.name
                }
              })

              let clientId: string

              if (existingClient) {
                clientId = existingClient.id
                // Update existing client
                await prisma.clients.update({
                  where: { id: existingClient.id },
          data: {
                    email: profile.email || existingClient.email,
                    phone: profile.phone || existingClient.phone,
                    updatedAt: new Date()
                  }
                })
              } else {
                // Create new client
                const newClient = await prisma.clients.create({
            data: {
                    id: crypto.randomUUID(),
                    trainerId: trainer.id,
                    name: profile.name,
                    email: profile.email || null,
                    phone: profile.phone || null,
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                })
                clientId = newClient.id
              }

              extractedProfiles.push({
                clientId,
                clientName: profile.name,
                clientAge: profile.age,
                clientEmail: profile.email,
                clientPhone: profile.phone,
                medicalHistory: profile.medicalHistory || [],
                injuries: profile.injuries || [],
                confidence: 0.9
              })

              // Store goals
              if (parsed.goals && parsed.goals.length > 0) {
                for (const goal of parsed.goals) {
                  extractedGoals.push({
                    clientId,
                    goalDescription: goal.description,
                    goalCategory: goal.category || 'general',
                    priority: goal.priority || 'medium',
                    targetDate: goal.targetDate,
                  })
                }
              }

              // Store progress entries
              if (parsed.progressEntries && parsed.progressEntries.length > 0) {
                for (const entry of parsed.progressEntries) {
                  extractedProgress.push({
                    clientId,
                    progressDate: entry.date,
                    description: entry.observations || '',
                    metrics: entry.metrics || {}
                  })
                }
              }

              // Generate recommendation
              if (parsed.goals && parsed.goals.length > 0) {
                const mainGoal = parsed.goals[0]
                recommendations.push({
                  clientId,
                  recommendationText: `Based on their goal of "${mainGoal.description}", recommend focusing on ${mainGoal.category} training with progressive overload.`,
                  suggestedDuration: 60
                })
              }
            }
          }
        }

      } catch (fileError: any) {
        console.error(`Error processing file ${file.name}:`, fileError)
        // Continue with next file
      }
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        extractedProfiles,
        extractedProgress,
        extractedGoals,
        recommendations,
        filesProcessed: files.length
      },
      processingTime
    })

  } catch (error: any) {
    console.error('Error processing documents:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process documents' 
      },
      { status: 500 }
    )
  }
}

// GET /api/gia/process-documents - Get processed profiles
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return clients created by document processing
    const clients = await prisma.clients.findMany({
      where: { trainerId: trainer.id },
        orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      success: true,
      profiles: clients,
    })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
