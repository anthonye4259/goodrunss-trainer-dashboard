import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/gia/templates
 * Get available content templates
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('type');

    const templates = [
      {
        id: 'workout-tip-form',
        name: 'Perfect Form Tips',
        contentType: 'workout_tip',
        description: 'Generate tips about proper exercise form',
        prompts: [
          'Create a tip about proper squat form',
          'Explain the correct deadlift technique',
          'Tips for proper bench press form',
        ],
        tone: 'educational',
        length: 'short',
      },
      {
        id: 'workout-tip-motivation',
        name: 'Motivational Tips',
        contentType: 'workout_tip',
        description: 'Create motivational workout tips',
        prompts: [
          'Write a motivational tip for staying consistent',
          'Create a tip about overcoming workout plateaus',
          'Motivate clients to push through tough workouts',
        ],
        tone: 'motivational',
        length: 'short',
      },
      {
        id: 'social-post-transformation',
        name: 'Transformation Story',
        contentType: 'social_post',
        description: 'Share client transformation stories',
        prompts: [
          'Write about a client who lost 30 pounds',
          'Share a strength gain success story',
          'Post about a client reaching their fitness goal',
        ],
        tone: 'inspirational',
        length: 'medium',
      },
      {
        id: 'social-post-quick-tip',
        name: 'Quick Fitness Tip',
        contentType: 'social_post',
        description: 'Short, actionable fitness tips for social media',
        prompts: [
          'Share a quick cardio tip',
          'Post about the importance of hydration',
          'Give a tip about pre-workout nutrition',
        ],
        tone: 'casual',
        length: 'short',
      },
      {
        id: 'email-welcome',
        name: 'Welcome Email',
        contentType: 'email',
        description: 'Welcome new clients to your training program',
        prompts: [
          'Welcome a new client who just signed up',
          'Introduce your training philosophy to a new client',
          'Send a getting-started email to new members',
        ],
        tone: 'friendly',
        length: 'medium',
      },
      {
        id: 'email-check-in',
        name: 'Client Check-In',
        contentType: 'email',
        description: 'Check in with existing clients',
        prompts: [
          'Check in on a client\'s progress',
          'Follow up after a tough week',
          'Celebrate a client milestone via email',
        ],
        tone: 'supportive',
        length: 'medium',
      },
      {
        id: 'blog-beginner-guide',
        name: 'Beginner\'s Guide',
        contentType: 'blog',
        description: 'Educational content for fitness beginners',
        prompts: [
          'Write a beginner\'s guide to strength training',
          'Create a guide for starting a running program',
          'Explain gym equipment for beginners',
        ],
        tone: 'educational',
        length: 'long',
      },
      {
        id: 'nutrition-meal-prep',
        name: 'Meal Prep Tips',
        contentType: 'nutrition_advice',
        description: 'Practical meal prep and nutrition advice',
        prompts: [
          'Share meal prep tips for busy professionals',
          'Explain macro basics for muscle gain',
          'Give advice on healthy snacking',
        ],
        tone: 'practical',
        length: 'medium',
      },
      {
        id: 'marketing-landing-page',
        name: 'Landing Page Copy',
        contentType: 'marketing_copy',
        description: 'Compelling copy for your website',
        prompts: [
          'Write hero section copy for a personal training website',
          'Create compelling service descriptions',
          'Write testimonial request copy',
        ],
        tone: 'persuasive',
        length: 'short',
      },
      {
        id: 'program-design',
        name: 'Program Outline',
        contentType: 'client_program',
        description: 'Create client program outlines',
        prompts: [
          'Design a 12-week fat loss program outline',
          'Create a muscle building program for beginners',
          'Outline a sports performance training program',
        ],
        tone: 'professional',
        length: 'long',
      },
    ];

    const filtered = contentType
      ? templates.filter((t) => t.contentType === contentType)
      : templates;

    return NextResponse.json({
      templates: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

