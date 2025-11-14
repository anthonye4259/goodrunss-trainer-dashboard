import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/gia/customize
 * Customize/regenerate existing content or use a template
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      contentId, // Optional: if customizing existing content
      templateId, // Optional: if using a template
      prompt,
      customization,
      tone,
      length,
    } = body;

    let systemPrompt = '';
    let userPrompt = prompt || '';
    let originalContent = '';

    // If customizing existing content
    if (contentId) {
      const content = await prisma.giaContent.findUnique({
        where: { id: contentId },
      });

      if (!content || content.userId !== userId) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }

      originalContent = content.generatedContent;
      systemPrompt = `You are helping a fitness trainer customize their content. Make the requested changes while maintaining quality and professionalism.`;
      userPrompt = `Original content:\n${originalContent}\n\nCustomization request:\n${customization || prompt}`;
    }

    // If using a template
    if (templateId) {
      // Template prompts are defined in the templates route
      systemPrompt = `You are a professional fitness content creator. Generate high-quality, engaging content based on the template and user's specific needs.`;
    }

    // Generate customized content
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: systemPrompt
            ? `${systemPrompt}\n\n${userPrompt}`
            : userPrompt,
        },
      ],
    });

    const generatedContent = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Save the customized content
    const giaContent = await prisma.giaContent.create({
      data: {
        userId,
        contentType: contentId
          ? (
              await prisma.giaContent.findUnique({ where: { id: contentId } })
            )?.contentType || 'custom'
          : 'custom',
        prompt: userPrompt,
        generatedContent,
        tone: tone || 'professional',
        length: length || 'medium',
        metadata: {
          ...(contentId ? { originalContentId: contentId } : {}),
          ...(templateId ? { templateId } : {}),
          customization: customization || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      content: giaContent,
      message: 'Content customized',
    });
  } catch (error: any) {
    console.error('Error customizing content:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to customize content' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/gia/customize
 * Quick edit existing content with AI assistance
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contentId, instruction } = body;

    if (!contentId || !instruction) {
      return NextResponse.json(
        { error: 'Content ID and instruction required' },
        { status: 400 }
      );
    }

    // Get original content
    const content = await prisma.giaContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.userId !== userId) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Use AI to make the requested edit
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Please make the following change to this content:\n\nOriginal:\n${content.generatedContent}\n\nInstruction: ${instruction}\n\nProvide only the updated content, no explanations.`,
        },
      ],
    });

    const updatedContent = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Update the content
    const updated = await prisma.giaContent.update({
      where: { id: contentId },
      data: {
        generatedContent: updatedContent,
      },
    });

    return NextResponse.json({
      success: true,
      content: updated,
      message: 'Content updated',
    });
  } catch (error: any) {
    console.error('Error editing content:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to edit content' },
      { status: 500 }
    );
  }
}

