/**
 * AI Document Parser Service
 * 
 * Uses Claude 3.5 Sonnet with Vision to extract client data from documents
 * Supports: PDFs, images (JPEG, PNG), intake forms, medical history, workout logs
 */

import Anthropic from '@anthropic-ai/sdk'
import type {
  AIAnalysis,
  ExtractedClientInfo,
  ExtractedGoalInfo,
  ExtractedProgressInfo,
  ExtractedSessionInfo,
} from '@/lib/types/auto-crm'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Converts a file to base64 for Claude Vision API
 */
export async function fileToBase64(file: Buffer, mimeType: string): Promise<string> {
  return file.toString('base64')
}

/**
 * Extracts text and structured data from a document using Claude Vision
 */
export async function parseDocument(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<AIAnalysis> {
  try {
    const base64Data = await fileToBase64(fileBuffer, mimeType)

    // Determine if this is an image or PDF
    const isImage = mimeType.startsWith('image/')
    const isPdf = mimeType === 'application/pdf'

    if (!isImage && !isPdf) {
      throw new Error(`Unsupported file type: ${mimeType}`)
    }

    // Build the prompt for Claude
    const prompt = `
You are an expert AI assistant for fitness trainers. Your task is to analyze this document and extract relevant client information.

The document could be:
- A fitness intake form
- A medical history form
- A workout log
- Progress tracking sheet
- Assessment form
- Photo with handwritten notes

Extract the following information if present:

**CLIENT INFORMATION:**
- Name
- Age
- Email
- Phone
- Emergency contact (name, phone, relationship)
- Medical history (conditions, surgeries, etc.)
- Injuries (current or past)
- Medications
- Allergies

**GOALS:**
- Goal descriptions
- Goal categories (strength, endurance, flexibility, weight_loss, performance, rehabilitation, general_fitness)
- Target dates
- Priority (low, medium, high)
- Metrics (current and target values)

**PROGRESS:**
- Date
- Type (workout, measurement, assessment, milestone)
- Description
- Metrics (weight, reps, time, etc.)
- Notes

**SESSIONS/WORKOUTS:**
- Date
- Duration
- Exercises (name, sets, reps, weight)
- Intensity (low, moderate, high)
- Notes

Return your analysis as a **valid JSON object** with this structure:

{
  "confidence": <0-1>,
  "documentType": "medical_form" | "fitness_assessment" | "workout_log" | "progress_photo" | "intake_form" | "other",
  "extractedData": {
    "clientInfo": {
      "name": "...",
      "age": ...,
      "email": "...",
      "phone": "...",
      "emergencyContact": {
        "name": "...",
        "phone": "...",
        "relationship": "..."
      },
      "medicalHistory": ["..."],
      "injuries": ["..."],
      "medications": ["..."],
      "allergies": ["..."]
    },
    "goals": [
      {
        "description": "...",
        "category": "...",
        "targetDate": "...",
        "priority": "...",
        "metrics": {
          "current": "...",
          "target": "...",
          "unit": "..."
        }
      }
    ],
    "progress": [
      {
        "date": "...",
        "type": "...",
        "description": "...",
        "metrics": {...},
        "notes": "..."
      }
    ],
    "sessions": [
      {
        "date": "...",
        "duration": ...,
        "exercises": [
          {
            "name": "...",
            "sets": ...,
            "reps": "...",
            "weight": "...",
            "notes": "..."
          }
        ],
        "intensity": "...",
        "notes": "..."
      }
    ]
  },
  "suggestions": ["AI-generated recommendation 1", "..."],
  "flaggedIssues": ["Issue 1", "..."]
}

**Important:**
- Only include fields that have actual data from the document
- Set confidence based on how clearly you can read/interpret the document (1.0 = very clear, 0.5 = somewhat unclear, 0.2 = very unclear)
- Flag any medical concerns or contraindications
- Be conservative with interpretations - if unsure, note it in suggestions
- Return ONLY the JSON object, no other text

Analyze this document now:
    `.trim()

    // Call Claude with Vision
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Latest Claude with vision
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as any,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    // Extract and parse the JSON response
    const textContent = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Try to extract JSON from code block or raw text
    let jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/)
    let parsedData: AIAnalysis

    if (jsonMatch && jsonMatch[1]) {
      parsedData = JSON.parse(jsonMatch[1])
    } else {
      // Try parsing directly
      parsedData = JSON.parse(textContent)
    }

    console.log(`📄 Parsed document: ${fileName} (Type: ${parsedData.documentType}, Confidence: ${parsedData.confidence})`)

    return parsedData
  } catch (error) {
    console.error('❌ Error parsing document:', error)
    throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Batch process multiple documents
 */
export async function parseMultipleDocuments(
  files: Array<{ buffer: Buffer; mimeType: string; fileName: string }>
): Promise<AIAnalysis[]> {
  const results: AIAnalysis[] = []

  for (const file of files) {
    try {
      const analysis = await parseDocument(file.buffer, file.mimeType, file.fileName)
      results.push(analysis)
    } catch (error) {
      console.error(`Failed to parse ${file.fileName}:`, error)
      // Continue with other files even if one fails
      results.push({
        confidence: 0,
        documentType: 'other',
        extractedData: {},
        flaggedIssues: [`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`],
      })
    }
  }

  return results
}

/**
 * Generate AI recommendations based on extracted client data
 */
export async function generateRecommendations(
  clientInfo?: ExtractedClientInfo,
  goals?: ExtractedGoalInfo[],
  progress?: ExtractedProgressInfo[]
): Promise<string[]> {
  try {
    const prompt = `
You are an expert fitness trainer AI. Based on the following client information, provide 3-5 actionable recommendations for their training program.

**Client Info:**
${JSON.stringify(clientInfo, null, 2)}

**Goals:**
${JSON.stringify(goals, null, 2)}

**Recent Progress:**
${JSON.stringify(progress, null, 2)}

Provide recommendations as a JSON array of strings. Consider:
- Their medical history and injuries
- Their stated goals
- Recent progress patterns
- Any red flags or concerns

Return ONLY a JSON array like:
["Recommendation 1", "Recommendation 2", ...]
    `.trim()

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '[]'
    
    // Extract JSON array
    let jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/)
    let recommendations: string[]

    if (jsonMatch && jsonMatch[1]) {
      recommendations = JSON.parse(jsonMatch[1])
    } else {
      recommendations = JSON.parse(textContent)
    }

    return recommendations
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}

