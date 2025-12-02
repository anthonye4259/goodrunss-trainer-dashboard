import { prisma } from '@/lib/prisma'

export type MemoryCategory = 'preference' | 'fact' | 'pattern' | 'style'
export type MemorySource = 'explicit' | 'inferred' | 'observed'

export interface Memory {
    id: string
    trainerId: string
    category: MemoryCategory
    key: string
    value: string
    confidence: number
    source: MemorySource
    createdAt: Date
    updatedAt: Date
    lastUsedAt: Date
    useCount: number
}

/**
 * Store a new memory or update an existing one
 */
export async function storeMemory(
    trainerId: string,
    category: MemoryCategory,
    key: string,
    value: string,
    source: MemorySource = 'observed',
    confidence: number = 1.0
): Promise<Memory> {
    const memory = await prisma.giaMemory.upsert({
        where: {
            trainerId_key: {
                trainerId,
                key
            }
        },
        update: {
            value,
            confidence,
            source,
            updatedAt: new Date()
        },
        create: {
            trainerId,
            category,
            key,
            value,
            confidence,
            source
        }
    })

    return memory as Memory
}

/**
 * Get all memories for a trainer, optionally filtered by category
 */
export async function getMemories(
    trainerId: string,
    category?: MemoryCategory
): Promise<Memory[]> {
    const memories = await prisma.giaMemory.findMany({
        where: {
            trainerId,
            ...(category && { category })
        },
        orderBy: [
            { confidence: 'desc' },
            { lastUsedAt: 'desc' }
        ]
    })

    return memories as Memory[]
}

/**
 * Get a specific memory by key
 */
export async function getMemory(
    trainerId: string,
    key: string
): Promise<Memory | null> {
    const memory = await prisma.giaMemory.findUnique({
        where: {
            trainerId_key: {
                trainerId,
                key
            }
        }
    })

    return memory as Memory | null
}

/**
 * Update an existing memory
 */
export async function updateMemory(
    trainerId: string,
    key: string,
    value: string,
    confidence?: number
): Promise<Memory | null> {
    try {
        const memory = await prisma.giaMemory.update({
            where: {
                trainerId_key: {
                    trainerId,
                    key
                }
            },
            data: {
                value,
                ...(confidence !== undefined && { confidence }),
                updatedAt: new Date()
            }
        })

        return memory as Memory
    } catch (error) {
        return null
    }
}

/**
 * Delete a memory
 */
export async function deleteMemory(
    trainerId: string,
    key: string
): Promise<boolean> {
    try {
        await prisma.giaMemory.delete({
            where: {
                trainerId_key: {
                    trainerId,
                    key
                }
            }
        })
        return true
    } catch (error) {
        return false
    }
}

/**
 * Delete all memories for a trainer
 */
export async function clearAllMemories(trainerId: string): Promise<number> {
    const result = await prisma.giaMemory.deleteMany({
        where: { trainerId }
    })

    return result.count
}

/**
 * Get relevant memories based on conversation context
 * Uses a simple keyword matching for now, can be enhanced with embeddings
 */
export async function getRelevantMemories(
    trainerId: string,
    context: string,
    limit: number = 10
): Promise<Memory[]> {
    // Get all memories for the trainer
    const allMemories = await getMemories(trainerId)

    // Simple relevance scoring based on keyword matching
    const scoredMemories = allMemories.map(memory => {
        const contextLower = context.toLowerCase()
        const keyLower = memory.key.toLowerCase()
        const valueLower = memory.value.toLowerCase()

        let relevanceScore = 0

        // Boost if key appears in context
        if (contextLower.includes(keyLower)) {
            relevanceScore += 2
        }

        // Boost if value keywords appear in context
        const valueWords = valueLower.split(' ')
        valueWords.forEach(word => {
            if (word.length > 3 && contextLower.includes(word)) {
                relevanceScore += 0.5
            }
        })

        // Factor in confidence and usage
        relevanceScore *= memory.confidence
        relevanceScore += Math.log(memory.useCount + 1) * 0.1

        return {
            memory,
            relevanceScore
        }
    })

    // Sort by relevance and return top N
    const relevant = scoredMemories
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)
        .map(item => item.memory)

    // Update lastUsedAt and useCount for retrieved memories
    await Promise.all(
        relevant.map(memory =>
            prisma.giaMemory.update({
                where: { id: memory.id },
                data: {
                    lastUsedAt: new Date(),
                    useCount: { increment: 1 }
                }
            })
        )
    )

    return relevant
}

/**
 * Format memories for injection into system prompt
 */
export function formatMemoriesForPrompt(memories: Memory[]): string {
    if (memories.length === 0) {
        return ''
    }

    const byCategory = memories.reduce((acc, memory) => {
        if (!acc[memory.category]) {
            acc[memory.category] = []
        }
        acc[memory.category].push(memory)
        return acc
    }, {} as Record<string, Memory[]>)

    let prompt = '\n\nTRAINER MEMORY:\nYou have extensive knowledge about this trainer from previous conversations:\n\n'

    if (byCategory.preference) {
        prompt += 'PREFERENCES:\n'
        byCategory.preference.forEach(m => {
            prompt += `- ${m.key.replace(/_/g, ' ')}: ${m.value}\n`
        })
        prompt += '\n'
    }

    if (byCategory.fact) {
        prompt += 'FACTS:\n'
        byCategory.fact.forEach(m => {
            prompt += `- ${m.key.replace(/_/g, ' ')}: ${m.value}\n`
        })
        prompt += '\n'
    }

    if (byCategory.pattern) {
        prompt += 'PATTERNS:\n'
        byCategory.pattern.forEach(m => {
            prompt += `- ${m.key.replace(/_/g, ' ')}: ${m.value}\n`
        })
        prompt += '\n'
    }

    if (byCategory.style) {
        prompt += 'COACHING STYLE:\n'
        byCategory.style.forEach(m => {
            prompt += `- ${m.key.replace(/_/g, ' ')}: ${m.value}\n`
        })
        prompt += '\n'
    }

    prompt += 'Use this knowledge to provide highly personalized responses without asking for information you already know.\n'

    return prompt
}

/**
 * Consolidate similar memories (merge duplicates with lower confidence)
 */
export async function consolidateMemories(trainerId: string): Promise<number> {
    const memories = await getMemories(trainerId)
    let consolidated = 0

    // Group by category and find similar keys
    const byCategory = memories.reduce((acc, memory) => {
        if (!acc[memory.category]) {
            acc[memory.category] = []
        }
        acc[memory.category].push(memory)
        return acc
    }, {} as Record<string, Memory[]>)

    for (const category in byCategory) {
        const categoryMemories = byCategory[category]

        for (let i = 0; i < categoryMemories.length; i++) {
            for (let j = i + 1; j < categoryMemories.length; j++) {
                const mem1 = categoryMemories[i]
                const mem2 = categoryMemories[j]

                // Check if keys are similar (simple string similarity)
                if (areSimilarKeys(mem1.key, mem2.key)) {
                    // Keep the one with higher confidence, delete the other
                    if (mem1.confidence >= mem2.confidence) {
                        await deleteMemory(trainerId, mem2.key)
                    } else {
                        await deleteMemory(trainerId, mem1.key)
                    }
                    consolidated++
                }
            }
        }
    }

    return consolidated
}

/**
 * Simple string similarity check
 */
function areSimilarKeys(key1: string, key2: string): boolean {
    const words1 = key1.toLowerCase().split('_')
    const words2 = key2.toLowerCase().split('_')

    // If they share more than 50% of words, consider them similar
    const commonWords = words1.filter(w => words2.includes(w))
    const similarity = commonWords.length / Math.max(words1.length, words2.length)

    return similarity > 0.5
}
