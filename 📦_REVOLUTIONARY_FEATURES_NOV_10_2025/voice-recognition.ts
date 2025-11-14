/**
 * Voice Recognition Service for GIA AI Agent
 * 
 * Features:
 * - Speech-to-text processing
 * - Wake word detection ("Hey GIA")
 * - Voice command parsing
 * - Audio quality validation
 * 
 * Supports: Web Speech API, browser-based voice recognition
 */

export interface VoiceCommand {
  transcript: string;
  confidence: number;
  timestamp: Date;
  isCommand: boolean;
  wakeWordDetected: boolean;
}

export interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  wakeWords?: string[];
}

/**
 * Voice Recognition Manager
 */
export class VoiceRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private config: VoiceConfig;
  private onResultCallback?: (command: VoiceCommand) => void;
  private onErrorCallback?: (error: Error) => void;

  constructor(config: VoiceConfig = {}) {
    this.config = {
      language: config.language || 'en-US',
      continuous: config.continuous ?? true,
      interimResults: config.interimResults ?? true,
      maxAlternatives: config.maxAlternatives || 3,
      wakeWords: config.wakeWords || ['hey gia', 'ok gia', 'gia'],
    };
  }

  /**
   * Initialize the speech recognition
   */
  initialize(): boolean {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Speech Recognition not supported in this browser');
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    // Setup event listeners
    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      this.handleResult(event);
    };

    this.recognition.onerror = (event: any) => {
      console.error('❌ Voice recognition error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(event.error));
      }
    };

    this.recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      this.isListening = false;
      
      // Restart if continuous mode
      if (this.config.continuous && this.isListening) {
        this.recognition.start();
      }
    };

    return true;
  }

  /**
   * Handle speech recognition result
   */
  private handleResult(event: any) {
    const results = event.results;
    const lastResult = results[results.length - 1];
    
    if (!lastResult.isFinal) return; // Only process final results

    const transcript = lastResult[0].transcript.toLowerCase().trim();
    const confidence = lastResult[0].confidence;

    console.log(`🎤 Heard: "${transcript}" (${(confidence * 100).toFixed(1)}% confidence)`);

    // Check for wake word
    const wakeWordDetected = this.detectWakeWord(transcript);

    // Extract command (remove wake word if present)
    let commandText = transcript;
    if (wakeWordDetected) {
      this.config.wakeWords?.forEach(wakeWord => {
        commandText = commandText.replace(wakeWord, '').trim();
      });
    }

    const voiceCommand: VoiceCommand = {
      transcript: commandText,
      confidence,
      timestamp: new Date(),
      isCommand: wakeWordDetected || this.isListening,
      wakeWordDetected,
    };

    // Callback with command
    if (this.onResultCallback) {
      this.onResultCallback(voiceCommand);
    }
  }

  /**
   * Detect wake word in transcript
   */
  private detectWakeWord(transcript: string): boolean {
    if (!this.config.wakeWords) return false;
    
    return this.config.wakeWords.some(wakeWord => 
      transcript.includes(wakeWord.toLowerCase())
    );
  }

  /**
   * Start listening for voice commands
   */
  start(): boolean {
    if (!this.recognition) {
      console.error('❌ Voice recognition not initialized');
      return false;
    }

    if (this.isListening) {
      console.warn('⚠️ Already listening');
      return true;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('❌ Failed to start voice recognition:', error);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Toggle listening state
   */
  toggle(): boolean {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Set result callback
   */
  onResult(callback: (command: VoiceCommand) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set error callback
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    if (this.recognition) {
      this.recognition = null;
    }
  }
}

/**
 * Voice Command Parser
 * Extracts intent and parameters from voice commands
 */
export class VoiceCommandParser {
  /**
   * Parse voice command into structured data
   */
  static parse(transcript: string): {
    intent: string | null;
    params: Record<string, any>;
    confidence: number;
  } {
    const lower = transcript.toLowerCase().trim();

    // Intent patterns
    const patterns = [
      // Calendar/Schedule
      { pattern: /(?:what'?s|show|tell me) (?:on )?my schedule(?: today| tomorrow)?/i, intent: 'getSchedule' },
      { pattern: /(?:add|create|schedule) (?:a )?(?:session|booking|appointment)(?: with)?/i, intent: 'createBooking' },
      { pattern: /(?:cancel|delete|remove) (?:the )?(?:session|booking|appointment)/i, intent: 'cancelBooking' },
      
      // Clients
      { pattern: /(?:show|list|get) (?:my )?clients?/i, intent: 'listClients' },
      { pattern: /(?:tell me about|show|get) (?:client|info for)/i, intent: 'getClient' },
      
      // Payments
      { pattern: /(?:how much|what) (?:did I|have I) (?:make|made|earn|earned)/i, intent: 'getRevenue' },
      { pattern: /(?:show|get|list) (?:my )?(?:payments|earnings|revenue)/i, intent: 'listPayments' },
      { pattern: /(?:create|send|make) (?:an? )?invoice/i, intent: 'createInvoice' },
      
      // Messages
      { pattern: /(?:send|write) (?:a )?message/i, intent: 'sendMessage' },
      { pattern: /(?:show|check|get) (?:my )?messages/i, intent: 'getMessages' },
      
      // Analytics
      { pattern: /(?:show|get) (?:my )?(?:analytics|stats|statistics)/i, intent: 'getAnalytics' },
      { pattern: /(?:how many|what'?s my) (?:total )?(?:bookings?|sessions?|clients?)/i, intent: 'getStats' },
    ];

    // Find matching pattern
    for (const { pattern, intent } of patterns) {
      if (pattern.test(lower)) {
        const params = this.extractParams(lower, intent);
        return { intent, params, confidence: 0.85 };
      }
    }

    // No match found
    return { intent: null, params: {}, confidence: 0 };
  }

  /**
   * Extract parameters from command based on intent
   */
  private static extractParams(text: string, intent: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Time-based parameters
    if (text.includes('today')) params.timeframe = 'today';
    if (text.includes('tomorrow')) params.timeframe = 'tomorrow';
    if (text.includes('this week')) params.timeframe = 'week';
    if (text.includes('this month')) params.timeframe = 'month';
    if (text.includes('this year')) params.timeframe = 'year';

    // Extract names (basic)
    const nameMatch = text.match(/(?:with|for|to) ([A-Z][a-z]+ ?[A-Z]?[a-z]*)/);
    if (nameMatch) params.name = nameMatch[1];

    // Extract times
    const timeMatch = text.match(/(?:at |@)(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch) params.time = timeMatch[1];

    // Extract amounts
    const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch && intent.includes('payment')) {
      params.amount = parseFloat(amountMatch[1]);
    }

    return params;
  }
}

/**
 * Browser compatibility check
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Stop immediately
    return true;
  } catch (error) {
    console.error('❌ Microphone permission denied:', error);
    return false;
  }
}

