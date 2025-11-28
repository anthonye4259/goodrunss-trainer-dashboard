import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate personalized outreach message for a lead
 */
export async function generateLeadOutreach(lead: {
    name: string
    goals: string
    experience: string
    sport: string
    trainerName: string
}) {
    const prompt = `You are a friendly fitness trainer reaching out to a potential client.

Lead Information:
- Name: ${lead.name}
- Sport/Activity: ${lead.sport}
- Experience Level: ${lead.experience}
- Goals: ${lead.goals}

Your name: ${lead.trainerName}

Write a warm, personalized outreach message (2-3 sentences) that:
1. Shows you understand their specific goals
2. References their experience level
3. Offers to help them get started
4. Sounds natural and conversational (not salesy)

Keep it under 100 words.`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are an expert fitness trainer who writes warm, personalized outreach messages.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
    })

    return completion.choices[0].message.content || ''
}
