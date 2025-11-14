import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/i18n/translate
 * Auto-translate content to user's language
 * Uses Google Translate API or similar
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      contentType, // trainer_bio, workout_name, facility_description, etc.
      contentId,
      fieldName,
      text,
      targetLanguage,
    } = body;

    if (!contentType || !contentId || !fieldName || !text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if translation already exists
    const existing = await prisma.translation.findUnique({
      where: {
        contentType_contentId_fieldName_language: {
          contentType,
          contentId,
          fieldName,
          language: targetLanguage,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        translation: existing.translatedText,
        cached: true,
      });
    }

    // TODO: Call translation API (Google Translate, DeepL, etc.)
    // For now, just store original text
    const translatedText = text; // Replace with actual translation

    // Save translation
    const translation = await prisma.translation.create({
      data: {
        contentType,
        contentId,
        fieldName,
        language: targetLanguage,
        originalText: text,
        translatedText,
        translatedBy: 'auto',
        translationService: 'google', // or 'deepl', 'azure'
        confidence: 0.95,
      },
    });

    return NextResponse.json({
      success: true,
      translation: translation.translatedText,
      cached: false,
    });
  } catch (error) {
    console.error('Error translating content:', error);
    return NextResponse.json(
      { error: 'Failed to translate content' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/i18n/translate?contentType=trainer_bio&contentId=123&language=es
 * Get translated content
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');
    const language = searchParams.get('language');

    if (!contentType || !contentId || !language) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const translations = await prisma.translation.findMany({
      where: {
        contentType,
        contentId,
        language,
      },
    });

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}
