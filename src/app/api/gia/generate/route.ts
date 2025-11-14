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

    // Fetch trainer's profile to get specialties
    const trainer = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        specialties: true,
        bio: true,
        certifications: true,
      },
    });

    const specialties = trainer?.specialties || [];
    const primarySpecialty = specialties[0] || 'fitness';

    // Build AI prompt based on content type and specialty
    const systemPrompt = getSystemPrompt(contentType, tone, length, primarySpecialty, specialties);

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
  length: string,
  primarySpecialty: string,
  allSpecialties: string[]
): string {
  // Map specialty to specific context
  const specialtyContext = getSpecialtyContext(primarySpecialty);
  const specialtyList = allSpecialties.length > 0 
    ? allSpecialties.join(', ') 
    : 'general fitness';

  const prompts: Record<string, string> = {
    workout_tip: `You are a professional ${primarySpecialty} instructor/coach (specialties: ${specialtyList}). Generate a ${tone} ${length} workout tip that is practical, actionable, and motivating. Focus on proper form, safety, and effectiveness SPECIFIC to ${primarySpecialty}. ${specialtyContext}`,
    
    social_post: `You are a social media manager for a ${primarySpecialty} instructor/coach (specialties: ${specialtyList}). Create a ${tone} ${length} social media post that is engaging, shareable, and authentic. Include relevant hashtags specific to ${primarySpecialty} and a call-to-action. ${specialtyContext}`,
    
    email: `You are a business consultant for ${primarySpecialty} instructors/coaches (specialties: ${specialtyList}). Write a ${tone} ${length} email for this trainer to send to their clients. Make it personalized, valuable, and action-oriented, reflecting the ${primarySpecialty} training style. ${specialtyContext}`,
    
    blog: `You are a ${primarySpecialty} content writer (specialties: ${specialtyList}). Write a ${tone} ${length} blog post that is informative, SEO-friendly, and provides real value to ${primarySpecialty} practitioners/athletes. Include an introduction, main points, and conclusion. ${specialtyContext}`,
    
    nutrition_advice: `You are a certified nutritionist specializing in ${primarySpecialty} athletes/clients (specialties: ${specialtyList}). Provide ${tone} ${length} nutrition advice that is evidence-based, safe, and practical for ${primarySpecialty} performance. Always include disclaimers when appropriate. ${specialtyContext}`,
    
    marketing_copy: `You are a marketing copywriter specializing in ${primarySpecialty} coaching/instruction (specialties: ${specialtyList}). Create ${tone} ${length} marketing copy that converts, highlighting benefits over features, and includes social proof relevant to ${primarySpecialty}. ${specialtyContext}`,
    
    client_program: `You are an expert ${primarySpecialty} coach/instructor (specialties: ${specialtyList}). Design a ${tone} ${length} client program outline that is personalized, progressive, and results-driven for ${primarySpecialty}. ${specialtyContext}`,
  };

  return prompts[contentType] || prompts.workout_tip;
}

/**
 * Get sport-specific context for better content generation
 */
function getSpecialtyContext(specialty: string): string {
  const contexts: Record<string, string> = {
    basketball: 'Focus on court drills, vertical jump training, lateral quickness, defensive footwork, and sport-specific conditioning.',
    pickleball: 'Focus on paddle technique, court positioning, dinking drills, net play, and agility for quick directional changes.',
    tennis: 'Focus on stroke mechanics, footwork patterns, serve technique, court coverage, and match conditioning.',
    yoga: 'Focus on flow sequences, breath work (pranayama), pose modifications, mindfulness, and different styles (vinyasa, yin, restorative).',
    pilates: 'Focus on core stability, controlled movements, breath coordination, reformer exercises, and mat work (hundred, roll-up, leg stretches).',
    barre: 'Focus on isometric holds, small pulsing movements, ballet-inspired sequences, core engagement, and flexibility.',
    strength_training: 'Focus on progressive overload, compound movements, proper lifting form, periodization, and muscle hypertrophy.',
    hiit: 'Focus on high-intensity intervals, work-to-rest ratios, metabolic conditioning, and efficient calorie burn.',
    crossfit: 'Focus on functional movements, WODs (workout of the day), Olympic lifts, gymnastics skills, and community motivation.',
    running: 'Focus on running form, cadence, interval training, endurance building, and injury prevention.',
    cycling: 'Focus on cadence, power zones, hill training, group ride dynamics, and bike fit.',
    swimming: 'Focus on stroke technique, breathing patterns, turns, interval training, and open water skills.',
    martial_arts: 'Focus on technique, forms (kata), sparring, discipline, and belt progression.',
    boxing: 'Focus on footwork, punch combinations, defensive movements, conditioning, and pad work.',
    dance: 'Focus on choreography, rhythm, technique, flexibility, and performance quality.',
    soccer: 'Focus on ball control, passing accuracy, shooting technique, tactical positioning, and game fitness.',
    volleyball: 'Focus on serving technique, passing form, hitting mechanics, blocking, and team rotation.',
    golf: 'Focus on swing mechanics, short game, putting technique, course management, and mental game.',
    nutrition: 'Focus on macronutrients, meal timing, supplements, hydration, and sport-specific nutrition strategies.',
    wellness: 'Focus on holistic health, stress management, recovery, sleep quality, and lifestyle balance.',
    fitness: 'Focus on overall health, progressive training, proper form, and sustainable habits.',
  };

  const normalizedSpecialty = specialty.toLowerCase().replace(/[_\s-]+/g, '_');
  return contexts[normalizedSpecialty] || contexts.fitness;
}

function getLengthTokens(length: string): number {
  const tokens: Record<string, number> = {
    short: 300,
    medium: 800,
    long: 2000,
  };
  return tokens[length] || tokens.medium;
}

