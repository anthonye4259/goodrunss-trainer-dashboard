import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate a lead magnet using AI
 */
export async function generateLeadMagnet(
    specialty: string,
    targetClient: string,
    format: 'workout-plan' | 'nutrition-guide' | 'challenge'
) {
    const formatDescriptions = {
        'workout-plan': '7-day workout plan with daily exercises, sets, reps, and rest periods',
        'nutrition-guide': '7-day nutrition guide with meal plans, recipes, and shopping lists',
        'challenge': '30-day fitness challenge with daily tasks and progress tracking'
    }

    const prompt = `You are a professional fitness trainer creating a lead magnet to attract new clients.

Create a ${formatDescriptions[format]} for ${targetClient} focused on ${specialty}.

Requirements:
- Professional and engaging tone
- Actionable and easy to follow
- Minimal equipment needed
- Suitable for ${targetClient}
- Include motivational tips
- Add progress tracking elements

Format the response as JSON with this structure:
{
  "title": "Catchy title",
  "subtitle": "Brief description",
  "introduction": "2-3 paragraphs explaining what they'll get",
  "content": {
    "day1": { "title": "", "description": "", "exercises": [] },
    "day2": { "title": "", "description": "", "exercises": [] },
    ...
  },
  "tips": ["Tip 1", "Tip 2", ...],
  "nextSteps": "What to do after completing this"
}`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are an expert fitness trainer and content creator.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    })

    const content = JSON.parse(completion.choices[0].message.content || '{}')
    return content
}

/**
 * Generate landing page copy for a lead magnet
 */
export async function generateLandingPage(leadMagnet: any, trainerName: string) {
    const prompt = `Create compelling landing page copy for this lead magnet:

Title: ${leadMagnet.title}
Description: ${leadMagnet.subtitle}
Trainer: ${trainerName}

Generate:
1. Headline (attention-grabbing, benefit-focused)
2. Subheadline (expands on headline)
3. 3-5 bullet points of benefits
4. Call-to-action text
5. Social proof statement

Format as JSON:
{
  "headline": "",
  "subheadline": "",
  "benefits": [],
  "cta": "",
  "socialProof": ""
}`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are an expert copywriter specializing in fitness marketing.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
    })

    return JSON.parse(completion.choices[0].message.content || '{}')
}

/**
 * Generate email nurture sequence
 */
export async function generateEmailSequence(leadMagnet: any, trainerName: string) {
    const prompt = `Create a 7-day email nurture sequence for someone who downloaded this lead magnet:

Title: ${leadMagnet.title}
Trainer: ${trainerName}

Create 7 emails with:
- Day 0: Welcome + deliver lead magnet
- Day 1: Check-in + quick tip
- Day 3: Success story + social proof
- Day 5: Limited offer (20% off first month)
- Day 7: Last chance + book discovery call

Each email should have:
- Subject line (compelling, personalized)
- Preview text
- Body (friendly, helpful tone)
- Call-to-action

Format as JSON array of emails.`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are an expert email marketer for fitness professionals.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    })

    return JSON.parse(completion.choices[0].message.content || '{}')
}

/**
 * Generate social media post
 */
export async function generateSocialPost(
    topic: string,
    platform: 'instagram' | 'tiktok' | 'facebook',
    trainerName: string,
    specialty: string
) {
    const platformGuidelines = {
        instagram: 'Instagram post with engaging caption, emojis, and 10-15 relevant hashtags. Max 2,200 characters.',
        tiktok: 'TikTok script with hook (first 3 seconds), main content, and call-to-action. Include on-screen text suggestions.',
        facebook: 'Facebook post with conversational tone, question to drive engagement, and clear call-to-action.'
    }

    const prompt = `Create a ${platform} post about: ${topic}

Trainer: ${trainerName}
Specialty: ${specialty}
Platform: ${platformGuidelines[platform]}

Format as JSON:
{
  "caption": "",
  "hashtags": [],
  "imagePrompt": "Description for image generation",
  "hook": "First line/hook" (TikTok only),
  "cta": "Call to action"
}`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are a social media expert for fitness influencers.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
    })

    return JSON.parse(completion.choices[0].message.content || '{}')
}

/**
 * Score a lead based on their information
 */
export async function scoreLead(leadInfo: {
    goals: string
    budget: string
    urgency: string
    experience: string
    trainerSpecialty: string
}) {
    const prompt = `Score this fitness lead from 0-100 based on quality and fit:

Lead Information:
- Goals: ${leadInfo.goals}
- Budget: ${leadInfo.budget}
- Urgency: ${leadInfo.urgency}
- Experience: ${leadInfo.experience}

Trainer Specialty: ${leadInfo.trainerSpecialty}

Provide:
1. Score (0-100)
2. Quality level (high/medium/low)
3. Reasons for score (3-5 bullet points)
4. Recommended action
5. Draft outreach message (personalized, friendly)

Format as JSON:
{
  "score": 0,
  "quality": "",
  "reasons": [],
  "recommendedAction": "",
  "draftMessage": ""
}`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are a sales expert helping fitness trainers qualify leads.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' }
    })

    return JSON.parse(completion.choices[0].message.content || '{}')
}
