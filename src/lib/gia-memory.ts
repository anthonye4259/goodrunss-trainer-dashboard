/**
 * GIA Memory System - Simple & Effective
 * Makes GIA remember everything across conversations
 */

import { prisma } from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════
// SAVE MEMORY
// ═══════════════════════════════════════════════════════════════

export async function saveMemory(params: {
  userId: string;
  memoryType: 'preference' | 'client_fact' | 'business_fact' | 'workflow' | 'pattern';
  category: string;
  key: string;
  value: string;
  importance?: number;
  source?: string;
}) {
  try {
    // Upsert: Update if exists, create if not
    const memory = await prisma.giaMemory.upsert({
      where: {
        userId_memoryType_category_key: {
          userId: params.userId,
          memoryType: params.memoryType,
          category: params.category,
          key: params.key,
        },
      },
      update: {
        value: params.value,
        importance: params.importance || 5,
        lastUsed: new Date(),
        useCount: { increment: 1 },
        updatedAt: new Date(),
      },
      create: {
        userId: params.userId,
        memoryType: params.memoryType,
        category: params.category,
        key: params.key,
        value: params.value,
        importance: params.importance || 5,
        source: params.source || 'conversation',
      },
    });

    return { success: true, memory };
  } catch (error) {
    console.error('Error saving memory:', error);
    return { success: false, error };
  }
}

// ═══════════════════════════════════════════════════════════════
// LOAD MEMORIES (For System Prompt)
// ═══════════════════════════════════════════════════════════════

export async function loadMemories(userId: string, limit: number = 30) {
  try {
    const memories = await prisma.giaMemory.findMany({
      where: { userId },
      orderBy: [
        { importance: 'desc' },
        { lastUsed: 'desc' },
      ],
      take: limit,
    });

    return memories;
  } catch (error) {
    console.error('Error loading memories:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// FORMAT MEMORIES FOR SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════

export function formatMemoriesForPrompt(memories: any[]): string {
  if (memories.length === 0) {
    return '';
  }

  // Group memories by type
  const grouped: { [key: string]: any[] } = {};
  memories.forEach((m) => {
    if (!grouped[m.memoryType]) {
      grouped[m.memoryType] = [];
    }
    grouped[m.memoryType].push(m);
  });

  const sections: string[] = [];

  // Preferences
  if (grouped.preference) {
    const prefs = grouped.preference.map((m) => `- ${m.key}: ${m.value}`).join('\n');
    sections.push(`**PREFERENCES:**\n${prefs}`);
  }

  // Client Facts
  if (grouped.client_fact) {
    const facts = grouped.client_fact.map((m) => `- ${m.key}: ${m.value}`).join('\n');
    sections.push(`**CLIENT FACTS:**\n${facts}`);
  }

  // Business Facts
  if (grouped.business_fact) {
    const facts = grouped.business_fact.map((m) => `- ${m.key}: ${m.value}`).join('\n');
    sections.push(`**BUSINESS FACTS:**\n${facts}`);
  }

  // Workflows
  if (grouped.workflow) {
    const workflows = grouped.workflow.map((m) => `- ${m.key}: ${m.value}`).join('\n');
    sections.push(`**YOUR WORKFLOWS:**\n${workflows}`);
  }

  // Patterns
  if (grouped.pattern) {
    const patterns = grouped.pattern.map((m) => `- ${m.key}: ${m.value}`).join('\n');
    sections.push(`**PATTERNS I'VE NOTICED:**\n${patterns}`);
  }

  return sections.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════
// EXTRACT MEMORIES FROM CONVERSATION (Auto-Learning)
// ═══════════════════════════════════════════════════════════════

export async function extractAndSaveMemories(
  userId: string,
  userMessage: string,
  assistantMessage: string
) {
  const memories: any[] = [];

  // Extract preferences (when user explicitly states them)
  const prefPatterns = [
    { regex: /I prefer (.*?)(?:\.|$)/i, key: 'communication_preference' },
    { regex: /I like to (.*?)(?:\.|$)/i, key: 'preference' },
    { regex: /I usually (.*?)(?:\.|$)/i, key: 'usual_behavior' },
    { regex: /I always (.*?)(?:\.|$)/i, key: 'always_does' },
  ];

  for (const pattern of prefPatterns) {
    const match = userMessage.match(pattern.regex);
    if (match) {
      await saveMemory({
        userId,
        memoryType: 'preference',
        category: 'communication',
        key: pattern.key,
        value: match[1].trim(),
        importance: 8,
        source: 'explicit',
      });
    }
  }

  // Extract client facts (injuries, goals, notes)
  const clientPatterns = [
    { regex: /(.*?) has (?:a |an )?(.*? injury|bad .*?|problem with .*?)(?:\.|$)/i, type: 'injury' },
    { regex: /(.*?) wants to (.*?)(?:\.|$)/i, type: 'goal' },
    { regex: /(.*?) can't (.*?)(?:\.|$)/i, type: 'limitation' },
  ];

  for (const pattern of clientPatterns) {
    const match = userMessage.match(pattern.regex);
    if (match && match[1]) {
      const clientName = match[1].trim().toLowerCase();
      await saveMemory({
        userId,
        memoryType: 'client_fact',
        category: clientName,
        key: `${clientName}_${pattern.type}`,
        value: match[2]?.trim() || match[0],
        importance: 9,
        source: 'conversation',
      });
    }
  }

  // Extract business patterns (pricing, scheduling)
  if (userMessage.match(/\$\d+/)) {
    const price = userMessage.match(/\$(\d+)/)?.[1];
    if (price) {
      await saveMemory({
        userId,
        memoryType: 'business_fact',
        category: 'pricing',
        key: 'typical_session_price',
        value: `$${price}`,
        importance: 6,
        source: 'inferred',
      });
    }
  }

  // Extract time preferences
  const timeMatch = userMessage.match(/(?:at |around |about )(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (timeMatch) {
    await saveMemory({
      userId,
      memoryType: 'preference',
      category: 'scheduling',
      key: 'preferred_time',
      value: timeMatch[1],
      importance: 5,
      source: 'inferred',
    });
  }

  return memories;
}

// ═══════════════════════════════════════════════════════════════
// MARK MEMORY AS USED (Updates lastUsed, increments useCount)
// ═══════════════════════════════════════════════════════════════

export async function markMemoryUsed(memoryId: string) {
  try {
    await prisma.giaMemory.update({
      where: { id: memoryId },
      data: {
        lastUsed: new Date(),
        useCount: { increment: 1 },
      },
    });
  } catch (error) {
    console.error('Error marking memory as used:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// QUICK SAVE HELPERS (Convenience Functions)
// ═══════════════════════════════════════════════════════════════

export async function savePreference(userId: string, key: string, value: string, importance: number = 7) {
  return saveMemory({
    userId,
    memoryType: 'preference',
    category: 'general',
    key,
    value,
    importance,
  });
}

export async function saveClientFact(userId: string, clientName: string, key: string, value: string) {
  return saveMemory({
    userId,
    memoryType: 'client_fact',
    category: clientName.toLowerCase(),
    key: `${clientName.toLowerCase()}_${key}`,
    value,
    importance: 9,
  });
}

export async function saveBusinessFact(userId: string, category: string, key: string, value: string) {
  return saveMemory({
    userId,
    memoryType: 'business_fact',
    category,
    key,
    value,
    importance: 6,
  });
}

export async function saveWorkflow(userId: string, workflowName: string, steps: string) {
  return saveMemory({
    userId,
    memoryType: 'workflow',
    category: 'custom',
    key: workflowName,
    value: steps,
    importance: 8,
  });
}

export async function savePattern(userId: string, patternName: string, observation: string) {
  return saveMemory({
    userId,
    memoryType: 'pattern',
    category: 'observed',
    key: patternName,
    value: observation,
    importance: 7,
  });
}
