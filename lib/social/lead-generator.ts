// Lead Generator Orchestrator - Combines Reddit, Apollo, and Hunter

import { searchReddit } from './reddit'
import { searchApolloContacts, FITNESS_SEARCH_TEMPLATES } from './apollo'
import { findEmail, verifyEmail, guessDomain } from './hunter'
import { prisma } from '@/lib/prisma'

export interface GeneratedLead {
    trainerId: string
    name: string | null
    email: string | null
    phone: string | null
    company: string | null
    title: string | null
    location: string | null
    source: 'reddit' | 'apollo' | 'hunter'
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
        // 1. Reddit Leads (3-5 leads)
        const redditLeads = await generateRedditLeads(trainer)
        leads.push(...redditLeads)

        // 2. Apollo Leads (2-3 leads)
        const apolloLeads = await generateApolloLeads(trainer)
        leads.push(...apolloLeads)

        // 3. Enrich with Hunter (if email missing)
        await enrichLeadsWithHunter(leads)

        // 4. Generate draft replies using Gia
        await generateDraftReplies(leads, trainer)

        // 5. Sort by match score
        leads.sort((a, b) => b.matchScore - a.matchScore)

        // 6. Take top 10
        return leads.slice(0, 10)
    } catch (error) {
        console.error('Error generating leads for trainer:', trainer.id, error)
        return leads
    }
}

async function generateRedditLeads(trainer: TrainerProfile): Promise<GeneratedLead[]> {
    const leads: GeneratedLead[] = []

    // Build search query based on specialty
    const specialty = trainer.specialties?.[0] || 'fitness'
    const queries = [
        `looking for ${specialty} coach`,
        `${specialty} trainer needed`,
        `${specialty} help`,
        `${specialty} form check`
    ]

    for (const query of queries.slice(0, 2)) { // Limit to 2 queries
        try {
            const result = await searchReddit(query, 5)

            for (const post of result.posts.slice(0, 3)) { // Top 3 per query
                const matchScore = calculateRedditMatchScore(post, trainer)

                if (matchScore >= 50) { // Only include decent matches
                    leads.push({
                        trainerId: trainer.id,
                        name: post.author,
                        email: null,
                        phone: null,
                        company: null,
                        title: null,
                        location: null,
                        source: 'reddit',
                        sourceUrl: post.permalink,
                        sourceData: post,
                        content: `${post.title}\n\n${post.selftext}`,
                        context: `Posted in r/${post.subreddit} about ${specialty}`,
                        matchScore,
                        draftReply: null
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching Reddit leads:', error)
        }
    }

    return leads
}

async function generateApolloLeads(trainer: TrainerProfile): Promise<GeneratedLead[]> {
    const leads: GeneratedLead[] = []

    try {
        // Use corporate wellness template
        const searchParams = {
            ...FITNESS_SEARCH_TEMPLATES.corporateWellness,
            organizationLocations: trainer.state ? [trainer.state] : undefined,
            perPage: 5
        }

        const result = await searchApolloContacts(searchParams)

        for (const contact of result.contacts.slice(0, 3)) { // Top 3
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

async function enrichLeadsWithHunter(leads: GeneratedLead[]) {
    for (const lead of leads) {
        if (!lead.email && lead.name && lead.company) {
            try {
                const [firstName, ...lastNameParts] = lead.name.split(' ')
                const lastName = lastNameParts.join(' ')
                const domain = guessDomain(lead.company)

                const emailResult = await findEmail(firstName, lastName, domain)

                if (emailResult && emailResult.email) {
                    lead.email = emailResult.email
                    lead.source = 'hunter' // Mark as enriched by Hunter
                }
            } catch (error) {
                console.error('Error enriching lead with Hunter:', error)
            }
        }
    }
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

Draft a ${lead.source === 'reddit' ? 'Reddit reply' : 'LinkedIn/email message'} that:
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

function calculateRedditMatchScore(post: any, trainer: TrainerProfile): number {
    let score = 50 // Base score

    const specialty = trainer.specialties?.[0]?.toLowerCase() || ''
    const content = `${post.title} ${post.selftext}`.toLowerCase()

    // Specialty match
    if (content.includes(specialty)) score += 20

    // Recency (within 24 hours = +10, within week = +5)
    const ageHours = (Date.now() - post.created_utc * 1000) / (1000 * 60 * 60)
    if (ageHours < 24) score += 10
    else if (ageHours < 168) score += 5

    // Engagement
    if (post.score > 10) score += 5
    if (post.num_comments < 5) score += 10 // Less competition

    // Quality indicators
    if (post.selftext.length > 100) score += 5 // Detailed post
    if (content.includes('looking for') || content.includes('need help')) score += 10

    return Math.min(100, Math.max(0, score))
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
