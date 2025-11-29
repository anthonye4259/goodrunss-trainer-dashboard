/**
 * GIA Session Plan Generator Service
 * Generates complete session plans in under 20 seconds using AI
 */

import Anthropic from '@anthropic-ai/sdk'
import type {
  GenerateSessionPlanInput,
  AISessionPlanResult,
  WarmupExercise,
  Drill,
  CooldownExercise,
  VideoPlaylist,
  InstagramContent,
} from '@/lib/types/gia-session-plan'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

/**
 * Generate a complete session plan using Claude
 * Target: <10 seconds for AI generation
 */
export async function generateSessionPlan(
  input: GenerateSessionPlanInput
): Promise<AISessionPlanResult> {
  const startTime = Date.now()

  // Build the AI prompt
  const prompt = buildSessionPlanPrompt(input)

  try {
    // Call Claude API with streaming disabled for faster response
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620', // Valid Claude model
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract the JSON response
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse the AI response
    const result = parseAIResponse(content.text, input)

    const endTime = Date.now()
    console.log(`✅ Session plan generated in ${endTime - startTime}ms`)

    return result
  } catch (error) {
    console.error('Error generating session plan:', error)
    throw new Error('Failed to generate session plan')
  }
}

/**
 * Build the AI prompt for session generation
 */
function buildSessionPlanPrompt(input: GenerateSessionPlanInput): string {
  const { clientName, clientAge, clientLevel, sport } = input

  return `You are GIA (GoodRunss Intelligent Assistant), an expert ${sport} coach creating a personalized 45-minute session plan.

**CLIENT PROFILE:**
- Name: ${clientName}
- Age: ${clientAge || 'Not specified'}
- Level: ${clientLevel}
- Sport: ${sport}

**YOUR TASK:**
Generate a COMPLETE, DETAILED 45-minute ${sport} session plan that includes:

1. **Warmup (5-7 minutes)**: 3-4 dynamic exercises specific to ${sport}
2. **Drills (30-35 minutes)**: 4-6 progressive drills that build skills
3. **Cooldown (5 minutes)**: Stretching and recovery exercises
4. **Notes**: Coaching tips and what to focus on
5. **Progressions**: How to make drills easier or harder
6. **Video Playlist**: 4-5 YouTube videos (real URLs) that demonstrate techniques
7. **Instagram Content**: Post caption, hashtags, and tips for sharing
8. **Message to Client**: Encouraging message to send them

**IMPORTANT:**
- Make it specific to ${clientLevel} level
- Include exact rep counts, duration, and instructions
- Video URLs must be REAL YouTube links (search your knowledge)
- Instagram content should be motivational and shareable
- Message should be personal and encouraging

**RESPONSE FORMAT (JSON):**
Return ONLY valid JSON in this exact structure:

\`\`\`json
{
  "sessionDuration": 45,
  "warmup": {
    "duration": 5,
    "exercises": [
      {
        "name": "Exercise name",
        "duration": 2,
        "instructions": "Step-by-step instructions",
        "reps": 10,
        "sets": 2
      }
    ]
  },
  "drills": [
    {
      "name": "Drill name",
      "duration": 8,
      "description": "What this drill teaches",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "difficulty": "beginner|intermediate|advanced",
      "focus": ["skill1", "skill2"],
      "equipment": ["item1", "item2"]
    }
  ],
  "cooldown": {
    "duration": 5,
    "exercises": [
      {
        "name": "Stretch name",
        "duration": 2,
        "instructions": "How to do it",
        "benefits": "Why it helps"
      }
    ]
  },
  "notes": "Coaching notes and focus points for this session",
  "progressions": "How to make drills easier (regression) or harder (progression)",
  "videoPlaylist": {
    "platform": "youtube",
    "videos": [
      {
        "id": "video_id",
        "title": "Video title",
        "url": "https://youtube.com/watch?v=...",
        "duration": 300
      }
    ]
  },
  "instagramContent": {
    "caption": "Motivational caption about the workout",
    "hashtags": ["#${sport}", "#training", "#fitness"],
    "tips": ["Tip 1", "Tip 2", "Tip 3"]
  },
  "messageToClient": "Personal message to ${clientName}"
}
\`\`\`

Generate the complete session plan NOW. Return ONLY the JSON, no other text.`
}

/**
 * Parse the AI response into structured data
 */
function parseAIResponse(
  responseText: string,
  input: GenerateSessionPlanInput
): AISessionPlanResult {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim()
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/```\s*$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/```\s*$/, '')
    }

    const parsed = JSON.parse(jsonText)

    // Validate the response structure
    if (!parsed.warmup || !parsed.drills || !parsed.cooldown) {
      throw new Error('Invalid session plan structure')
    }

    return parsed as AISessionPlanResult
  } catch (error) {
    console.error('Error parsing AI response:', error)
    console.error('Response text:', responseText)
    
    // Return a fallback plan if parsing fails
    return generateFallbackPlan(input)
  }
}

/**
 * Generate a fallback plan if AI fails
 */
function generateFallbackPlan(input: GenerateSessionPlanInput): AISessionPlanResult {
  const { clientName, clientLevel, sport } = input

  return {
    sessionDuration: 45,
    warmup: {
      duration: 5,
      exercises: [
        {
          name: 'Dynamic Stretching',
          duration: 2,
          instructions: 'Light stretching to prepare muscles',
          reps: 10,
          sets: 1,
        },
        {
          name: 'Light Jogging',
          duration: 3,
          instructions: 'Jog in place or around the court',
        },
      ],
    },
    drills: [
      {
        name: `${sport} Fundamentals`,
        duration: 15,
        description: `Basic ${sport} technique practice`,
        instructions: [
          'Start with basic form',
          'Focus on proper technique',
          'Increase intensity gradually',
        ],
        difficulty: clientLevel,
        focus: ['technique', 'fundamentals'],
        equipment: [`${sport} equipment`],
      },
      {
        name: 'Progressive Drill',
        duration: 20,
        description: 'Build on fundamentals',
        instructions: [
          'Apply techniques learned',
          'Practice at game speed',
          'Focus on consistency',
        ],
        difficulty: clientLevel,
        focus: ['application', 'consistency'],
        equipment: [`${sport} equipment`],
      },
    ],
    cooldown: {
      duration: 5,
      exercises: [
        {
          name: 'Static Stretching',
          duration: 5,
          instructions: 'Hold each stretch for 30 seconds',
          benefits: 'Improves flexibility and prevents injury',
        },
      ],
    },
    notes: `Focus on proper form and technique for ${clientLevel} level.`,
    progressions: 'Increase intensity, add variations, or extend duration.',
    videoPlaylist: {
      platform: 'youtube',
      videos: [
        {
          id: 'example',
          title: `${sport} Training Video`,
          url: 'https://youtube.com',
          duration: 300,
        },
      ],
    },
    instagramContent: {
      caption: `Great ${sport} session with ${clientName}! 💪`,
      hashtags: [`#${sport}`, '#training', '#fitness', '#coaching'],
      tips: [
        'Stay consistent with training',
        'Focus on proper technique',
        'Celebrate small wins',
      ],
    },
    messageToClient: `Hey ${clientName}! I've created a custom ${sport} session plan for you. Let's work on building your skills and having fun! 🎯`,
  }
}

/**
 * Generate a video playlist using YouTube search
 * (In production, you'd use YouTube Data API)
 */
export function generateVideoPlaylist(
  sport: string,
  level: string,
  drills: Drill[]
): VideoPlaylist {
  // For now, return example structure
  // In production, integrate with YouTube Data API
  const searchTerms = drills.slice(0, 5).map((drill) => {
    return `${sport} ${drill.name} ${level} tutorial`
  })

  return {
    platform: 'youtube',
    videos: searchTerms.map((term, index) => ({
      id: `video_${index}`,
      title: term,
      url: `https://youtube.com/results?search_query=${encodeURIComponent(term)}`,
      duration: 300,
      thumbnail: '',
    })),
  }
}




