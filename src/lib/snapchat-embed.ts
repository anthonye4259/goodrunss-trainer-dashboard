import { NextResponse } from 'next/server'

/**
 * Snapchat Embed Integration for GoodRunss
 * Allows users to embed their Snapchat Spotlight videos and Saved Stories
 */

export interface SnapchatEmbed {
  url: string
  width?: number
  height?: number
  type: 'spotlight' | 'lens' | 'saved_story'
}

/**
 * Generate Snapchat embed code
 */
export function generateSnapchatEmbed(embed: SnapchatEmbed): string {
  const width = embed.width || 416
  const height = embed.height || 692

  return `
<blockquote 
  class="snapchat-embed" 
  data-snapchat-embed-width="${width}" 
  data-snapchat-embed-height="${height}" 
  data-snapchat-embed-url="${embed.url}">
</blockquote>
<script async src="https://www.snapchat.com/embed.js"></script>
  `.trim()
}

/**
 * Validate Snapchat URL
 */
export function isValidSnapchatUrl(url: string): boolean {
  const validPatterns = [
    /^https:\/\/www\.snapchat\.com\/spotlight\/[\w-]+/,
    /^https:\/\/www\.snapchat\.com\/add\/[\w-]+/,
    /^https:\/\/lensstudio\.snapchat\.com\/[\w/-]+/,
  ]
  
  return validPatterns.some(pattern => pattern.test(url))
}

/**
 * Create Snapchat embed for fitness workout videos
 */
export function createWorkoutEmbed(snapchatUrl: string): {
  embedCode: string
  html: string
} {
  if (!isValidSnapchatUrl(snapchatUrl)) {
    throw new Error('Invalid Snapchat URL')
  }

  const embedCode = generateSnapchatEmbed({
    url: snapchatUrl,
    width: 416,
    height: 692,
    type: 'spotlight'
  })

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Workout Video - GoodRunss</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .workout-container {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
    }
    .workout-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .workout-header h1 {
      color: #333;
      font-size: 24px;
      margin: 0 0 8px 0;
    }
    .workout-header p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    .snapchat-embed {
      margin: 20px 0;
      border-radius: 12px;
      overflow: hidden;
    }
    .workout-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .workout-footer p {
      color: #999;
      font-size: 12px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="workout-container">
    <div class="workout-header">
      <h1>💪 Workout by G.I.A</h1>
      <p>Train Smarter • Train Safer • Train Better</p>
    </div>
    ${embedCode}
    <div class="workout-footer">
      <p>Powered by GoodRunss • Your AI fitness coach</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return { embedCode, html }
}

/**
 * API endpoint helper: Get Snapchat embed for workout
 */
export async function getSnapchatWorkoutEmbed(snapchatUrl: string, userId: string) {
  try {
    const { embedCode, html } = createWorkoutEmbed(snapchatUrl)

    // Store embed in database
    // await prisma.viralContent.create({
    //   data: {
    //     userId: userId,
    //     contentType: 'snapchat_embed',
    //     contentData: {
    //       snapchatUrl: snapchatUrl,
    //       embedCode: embedCode,
    //       html: html
    //     },
    //     shareCount: 0
    //   }
    // })

    return {
      success: true,
      embed: {
        embedCode: embedCode,
        html: html,
        url: snapchatUrl
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Snapchat embed'
    }
  }
}

/**
 * Generate shareable Snapchat workout content
 */
export function generateSnapchatShareContent(workoutDetails: {
  workoutType: string
  duration: string
  calories: string
  environmentalContext?: string
}): string {
  const { workoutType, duration, calories, environmentalContext } = workoutDetails

  const shareText = `💪 Just crushed a ${duration} ${workoutType} session! 

🔥 ${calories} calories burned
${
  environmentalContext 
    ? `🌍 G.I.A chose this workout based on perfect environmental conditions!\n\n${environmentalContext}`
    : '🌟 G.I.A knows what\'s best for me!'
}

🏃‍♀️ Training smarter, safer, and better with @GoodRunssAI

#GoodRunssAI #FitnessJourney #TrainSmarter #${workoutType.replace(/\s+/g, '')} #WorkoutMotivation #FitnessGoals #HealthyLifestyle #FitnessCoach #AIWorkout #TrainBetter`

  return shareText
}

/**
 * Snapchat story sharing integration
 */
export interface SnapchatStoryOptions {
  imageUrl: string
  workoutDetails: {
    workoutType: string
    duration: string
    calories: string
  }
  snapchatUrl?: string
}

export function createSnapchatStoryContent(options: SnapchatStoryOptions): {
  storyText: string
  hashtags: string[]
  embedCode?: string
} {
  const { workoutDetails, snapchatUrl } = options

  const storyText = generateSnapchatShareContent(workoutDetails)
  const hashtags = [
    '#GoodRunssAI',
    '#FitnessJourney',
    '#TrainSmarter',
    '#WorkoutMotivation',
    '#FitnessGoals',
    '#HealthyLifestyle',
    '#FitnessCoach',
    '#AIWorkout',
    '#TrainBetter',
    `#${workoutDetails.workoutType.replace(/\s+/g, '')}`
  ]

  return {
    storyText: storyText,
    hashtags: hashtags,
    embedCode: snapchatUrl ? generateSnapchatEmbed({
      url: snapchatUrl,
      width: 416,
      height: 692,
      type: 'spotlight'
    }) : undefined
  }
}

