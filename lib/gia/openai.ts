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

/**
 * Generate a draft response for a client conversation
 */
export async function generateMessageDraft(
    clientName: string,
    lastMessage: string,
    history: { role: 'user' | 'assistant', content: string }[],
    intent?: string
) {
    const prompt = `You are Gia, an AI Business Partner for a fitness trainer. You are drafting a reply to a client on behalf of the trainer.

Client: ${clientName}
Last Message: "${lastMessage}"
Intent/Instruction: ${intent || "Reply naturally and helpfully"}

Conversation History:
${history.map(m => `${m.role === 'user' ? 'Client' : 'Trainer'}: ${m.content}`).join('\n')}

Draft a response that is:
1. Professional but warm
2. Concise (under 50 words unless detailed explanation needed)
3. Directly addresses the client's last message
4. Aligned with the trainer's goal (retention, scheduling, etc.)

Draft:`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are an expert fitness trainer assistant.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 100
    })

    return completion.choices[0].message.content || ''
}
