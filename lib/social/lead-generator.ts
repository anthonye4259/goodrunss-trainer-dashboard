// Lead Generator Orchestrator - Combines Reddit, Apollo, and Hunter

import { searchApolloContacts, FITNESS_SEARCH_TEMPLATES } from './apollo'
import { prisma } from '@/lib/prisma'

export interface GeneratedLead {
    trainerId: string
    name: string | null
    email: string | null
    phone: string | null
    company: string | null
    title: string | null
    location: string | null
    source: 'apollo'
    sourceUrl: string | null
    sourceData: any
    content: string
    context: string | null
    matchScore: number
    draftReply: string | null
}

interface TrainerProfile {
    id: string
    name: string | null
    specialties: string[]
    location: string | null
    city: string | null
    state: string | null
}

export async function generateLeadsForTrainer(trainer: TrainerProfile): Promise<GeneratedLead[]> {
    const leads: GeneratedLead[] = []

    try {
        // 1. Apollo Leads (Fetch more since it's the only source)
        const apolloLeads = await generateApolloLeads(trainer)
        leads.push(...apolloLeads)

        // 2. Generate draft replies using Gia
        await generateDraftReplies(leads, trainer)

        // 3. Sort by match score
        leads.sort((a, b) => b.matchScore - a.matchScore)

        // 4. Take top 10
        return leads.slice(0, 10)
    } catch (error) {
        console.error('Error generating leads for trainer:', trainer.id, error)
        return leads
    }
}



async function generateApolloLeads(trainer: TrainerProfile): Promise<GeneratedLead[]> {
    const leads: GeneratedLead[] = []

    try {
        // Use corporate wellness template
        const searchParams = {
            ...FITNESS_SEARCH_TEMPLATES.corporateWellness,
            organizationLocations: trainer.state ? [trainer.state] : undefined,
            perPage: 15 // Fetch more to filter
        }

        const result = await searchApolloContacts(searchParams)

        for (const contact of result.contacts.slice(0, 10)) { // Top 10
            const matchScore = calculateApolloMatchScore(contact, trainer)

            if (matchScore >= 60) {
                leads.push({
                    trainerId: trainer.id,
                    name: contact.name,
                    email: contact.email,
                    phone: null,
                    company: contact.organization_name,
                    title: contact.title,
                    location: contact.city && contact.state ? `${contact.city}, ${contact.state}` : null,
                    source: 'apollo',
                    sourceUrl: contact.linkedin_url,
                    sourceData: contact,
                    content: `${contact.title} at ${contact.organization_name}`,
                    context: `Corporate wellness opportunity - ${contact.organization_name}`,
                    matchScore,
                    draftReply: null
                })
            }
        }
    } catch (error) {
        console.error('Error fetching Apollo leads:', error)
    }

    return leads
}



async function generateDraftReplies(leads: GeneratedLead[], trainer: TrainerProfile) {
    // Import OpenAI and memory functions
    const { default: OpenAI } = await import('openai')
    const { getRelevantMemories, formatMemoriesForPrompt } = await import('@/lib/gia/memory')

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    for (const lead of leads) {
        try {
            // Get trainer memories for personalization
            const memories = await getRelevantMemories(trainer.id, lead.content, 3)
            const memoryPrompt = formatMemoriesForPrompt(memories)

            const systemPrompt = `You are drafting an outreach message for a fitness trainer.
Trainer: ${trainer.name || 'Coach'}
Specialty: ${trainer.specialties?.[0] || 'Fitness'}

${memoryPrompt}

Draft a ${lead.source === 'reddit' ? 'Reddit reply' : lead.source === 'twitter' ? 'Twitter reply' : 'LinkedIn/email message'} that:
- Is helpful and non-salesy
- Offers genuine value
- Subtly positions the trainer as an expert
- Includes a soft call-to-action
- Is concise (2-3 paragraphs max)

Lead context: ${lead.context}
Lead content: ${lead.content}`

            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: 'Draft the message:' }
                ],
                temperature: 0.7,
                max_tokens: 300
            })

            lead.draftReply = response.choices[0].message.content || null
        } catch (error) {
            console.error('Error generating draft reply:', error)
        }
    }
}



function calculateApolloMatchScore(contact: any, trainer: TrainerProfile): number {
    let score = 60 // Base score for Apollo leads (pre-qualified)

    // Location match
    if (trainer.state && contact.state === trainer.state) score += 15
    if (trainer.city && contact.city === trainer.city) score += 10

    // Title relevance
    const title = contact.title?.toLowerCase() || ''
    if (title.includes('wellness') || title.includes('hr') || title.includes('people')) score += 10

    // Has email
    if (contact.email) score += 5

    return Math.min(100, Math.max(0, score))
}



export async function storeLeadsInDatabase(leads: GeneratedLead[]) {
    const stored = []

    for (const lead of leads) {
        try {
            const created = await prisma.dailyLead.create({
                data: {
                    trainerId: lead.trainerId,
                    name: lead.name,
                    email: lead.email,
                    phone: lead.phone,
                    company: lead.company,
                    title: lead.title,
                    location: lead.location,
                    source: lead.source,
                    sourceUrl: lead.sourceUrl,
                    sourceData: lead.sourceData,
                    content: lead.content,
                    context: lead.context,
                    matchScore: lead.matchScore,
                    draftReply: lead.draftReply,
                    status: 'new'
                }
            })
            stored.push(created)
        } catch (error) {
            console.error('Error storing lead:', error)
        }
    }

    return stored
}
