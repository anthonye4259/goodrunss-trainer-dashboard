import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/gia/generate
 * Generate AI content for trainers (tips, posts, emails, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      contentType, // workout_tip, social_post, email, blog, nutrition_advice
      prompt,
      tone = 'professional', // casual, professional, motivational, educational
      length = 'medium', // short, medium, long
      templateId,
      customization,
    } = body;

    if (!contentType || !prompt) {
      return NextResponse.json(
        { error: 'Content type and prompt required' },
        { status: 400 }
      );
    }

    // Build AI prompt based on content type
    const systemPrompt = getSystemPrompt(contentType, tone, length);

    // Generate content with Anthropic
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: getLengthTokens(length),
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${prompt}`,
        },
      ],
    });

    const generatedContent = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Save to database
    const giaContent = await prisma.giaContent.create({
      data: {
        userId,
        contentType,
        prompt,
        generatedContent,
        tone,
        length,
        metadata: customization ? JSON.parse(JSON.stringify(customization)) : null,
      },
    });

    return NextResponse.json({
      success: true,
      content: giaContent,
      message: 'Content generated',
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

function getSystemPrompt(
  contentType: string,
  tone: string,
  length: string
): string {
  const prompts: Record<string, string> = {
    workout_tip: `You are a professional fitness trainer. Generate a ${tone} ${length} workout tip that is practical, actionable, and motivating. Focus on proper form, safety, and effectiveness.`,
    
    social_post: `You are a social media manager for fitness trainers. Create a ${tone} ${length} social media post that is engaging, shareable, and authentic. Include relevant hashtags and a call-to-action.`,
    
    email: `You are a fitness business consultant. Write a ${tone} ${length} email for a trainer to send to their clients. Make it personalized, valuable, and action-oriented.`,
    
    blog: `You are a fitness content writer. Write a ${tone} ${length} blog post that is informative, SEO-friendly, and provides real value to readers. Include an introduction, main points, and conclusion.`,
    
    nutrition_advice: `You are a certified nutritionist. Provide ${tone} ${length} nutrition advice that is evidence-based, safe, and practical. Always include disclaimers when appropriate.`,
    
    marketing_copy: `You are a marketing copywriter specializing in fitness. Create ${tone} ${length} marketing copy that converts, highlighting benefits over features, and includes social proof.`,
    
    client_program: `You are an expert personal trainer. Design a ${tone} ${length} client program outline that is personalized, progressive, and results-driven.`,
  };

  return prompts[contentType] || prompts.workout_tip;
}

function getLengthTokens(length: string): number {
  const tokens: Record<string, number> = {
    short: 300,
    medium: 800,
    long: 2000,
  };
  return tokens[length] || tokens.medium;
}

