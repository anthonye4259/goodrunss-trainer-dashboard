/**
 * ElevenLabs Conversational AI Integration
 * Full voice agent for G.I.A - speak TO her and she speaks back!
 */

export interface VoiceSettings {
  stability: number; // 0-1
  similarity_boost: number; // 0-1
  style?: number; // 0-1
  use_speaker_boost?: boolean;
}

export interface ConversationConfig {
  agent: {
    prompt: {
      prompt: string;
      llm: string;
      temperature: number;
      max_tokens: number;
    };
    first_message: string;
    language: string;
  };
  tts: {
    voice_id: string;
    model_id: string;
    voice_settings: VoiceSettings;
  };
}

export interface ElevenLabsOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
}

// Recommended voices for G.I.A
export const GIA_VOICES = {
  // Female voices - Professional and friendly
  RACHEL: 'EXAVITQu4vr4xnSDxMaL', // Young, energetic
  BELLA: 'EXAVITQu4vr4xnSDxMaL', // Warm, friendly
  DOMI: 'AZnzlk1XvdvUeBnXmlld', // Strong, confident
  
  // Male voices (if needed)
  ADAM: 'pNInz6obpgDQGcFmaJgB', // Deep, professional
  
  // Default: Rachel (energetic fitness coach vibe)
  DEFAULT: 'EXAVITQu4vr4xnSDxMaL',
};

// Default voice settings for G.I.A
export const GIA_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.75, // Slightly varied for natural speech
  similarity_boost: 0.85, // High similarity to voice
  style: 0.5, // Moderate style
  use_speaker_boost: true,
};

/**
 * Convert text to speech using ElevenLabs
 * Returns audio buffer
 */
export async function textToSpeech(
  options: ElevenLabsOptions
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const {
    text,
    voiceId = GIA_VOICES.DEFAULT,
    modelId = 'eleven_monolingual_v1',
    voiceSettings = GIA_VOICE_SETTINGS,
  } = options;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

/**
 * Stream text to speech (for longer responses)
 * Returns a ReadableStream
 */
export async function textToSpeechStream(
  options: ElevenLabsOptions
): Promise<ReadableStream> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const {
    text,
    voiceId = GIA_VOICES.DEFAULT,
    modelId = 'eleven_monolingual_v1',
    voiceSettings = GIA_VOICE_SETTINGS,
  } = options;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response.body;
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`);
  }

  return response.json();
}

/**
 * Convert G.I.A text response to speech
 * Convenience wrapper for G.I.A-specific settings
 */
export async function giaSpeak(text: string): Promise<ArrayBuffer> {
  return textToSpeech({
    text,
    voiceId: GIA_VOICES.DEFAULT,
    voiceSettings: GIA_VOICE_SETTINGS,
  });
}

/**
 * Convert G.I.A text response to streaming speech
 * For real-time playback of longer responses
 */
export async function giaSpeakStream(text: string): Promise<ReadableStream> {
  return textToSpeechStream({
    text,
    voiceId: GIA_VOICES.DEFAULT,
    voiceSettings: GIA_VOICE_SETTINGS,
  });
}

/**
 * Create a conversational AI agent session
 * Returns signed URL for WebSocket connection
 */
export async function createConversationSession(
  userId: string,
  userRole: 'CLIENT' | 'TRAINER',
  userName: string
): Promise<{ signedUrl: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Build G.I.A's system prompt based on user role
  const systemPrompt = buildGIAPrompt(userId, userRole, userName);

  const config: ConversationConfig = {
    agent: {
      prompt: {
        prompt: systemPrompt,
        llm: 'gpt-4', // or 'gpt-3.5-turbo'
        temperature: 0.8,
        max_tokens: 500,
      },
      first_message: `Hi ${userName}! I'm G.I.A, your ${userRole === 'TRAINER' ? 'training business' : 'fitness'} assistant. How can I help you today?`,
      language: 'en',
    },
    tts: {
      voice_id: GIA_VOICES.DEFAULT,
      model_id: 'eleven_turbo_v2', // Faster for conversations
      voice_settings: GIA_VOICE_SETTINGS,
    },
  };

  const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create conversation: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return { signedUrl: data.conversation_signature_url };
}

/**
 * Build G.I.A's system prompt based on user context
 */
function buildGIAPrompt(
  userId: string,
  userRole: 'CLIENT' | 'TRAINER',
  userName: string
): string {
  const basePrompt = `You are G.I.A (GoodRunss Intelligent Assistant), a helpful, energetic, and professional AI fitness assistant.

User Information:
- Name: ${userName}
- Role: ${userRole}
- User ID: ${userId}

Communication Style:
- Be friendly, encouraging, and motivating
- Use fitness terminology appropriately
- Keep responses concise but informative
- Show enthusiasm for fitness and wellness
- Be supportive and non-judgmental

Safety & Boundaries:
- Only discuss fitness, training, sports, and wellness topics
- Do NOT provide medical advice
- Do NOT engage with inappropriate content
- Redirect off-topic conversations back to fitness
- If asked about something outside your scope, politely decline and suggest fitness-related topics

`;

  if (userRole === 'TRAINER') {
    return basePrompt + `
Trainer-Specific Features:
- Help with scheduling and client management
- Provide business insights and analytics
- Assist with workout program design
- Offer marketing and growth tips
- Track client progress and engagement

Focus on empowering trainers to grow their business and serve their clients better.`;
  } else {
    return basePrompt + `
Client-Specific Features:
- Help find trainers and facilities
- Provide workout recommendations
- Track fitness goals and progress
- Offer motivation and encouragement
- Answer questions about exercises and training

Focus on helping clients achieve their fitness goals and connect with great trainers.`;
  }
}

/**
 * Transcribe audio to text using ElevenLabs Speech-to-Text
 */
export async function speechToText(audioBlob: Blob): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const formData = new FormData();
  formData.append('audio', audioBlob);

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Speech-to-text error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.text;
}

export default {
  textToSpeech,
  textToSpeechStream,
  giaSpeak,
  giaSpeakStream,
  getAvailableVoices,
  createConversationSession,
  speechToText,
  GIA_VOICES,
  GIA_VOICE_SETTINGS,
};

