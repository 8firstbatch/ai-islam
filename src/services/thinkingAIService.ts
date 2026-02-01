interface ThinkingAIMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface ThinkingAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export class ThinkingAIService {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    // Use the provided API key for Thinking model from environment
    this.apiKey = import.meta.env.VITE_THINKING_GEMINI_API_KEY;
    
    // Validate API key
    if (!this.apiKey || this.apiKey.includes('your_thinking_gemini_api_key_here')) {
      console.error('❌ Thinking Gemini API key not configured. Please set VITE_THINKING_GEMINI_API_KEY in your environment variables');
    } else if (!this.apiKey.startsWith('AIzaSy')) {
      console.error('❌ Invalid Thinking Gemini API key format. Key should start with "AIzaSy"');
    } else {
      console.log('✅ Thinking Gemini API key configured successfully');
    }
  }

  async sendMessage(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options: {
      model?: string;
      stream?: boolean;
      onChunk?: (chunk: string) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<string> {
    const {
      model = 'gemini-2.5-pro',
      stream = false,
      onChunk,
      signal
    } = options;

    // Convert messages to Google AI format
    const thinkingMessages: ThinkingAIMessage[] = [];
    let systemInstruction = '';

    for (const message of messages) {
      if (message.role === 'system') {
        systemInstruction = message.content;
      } else {
        thinkingMessages.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }]
        });
      }
    }

    try {
      if (!this.apiKey) {
        throw new Error('Thinking Gemini API key not configured. Please set VITE_THINKING_GEMINI_API_KEY in your environment variables');
      }

      const url = `${this.baseURL}/models/${model}:generateContent?key=${this.apiKey}`;
      
      const requestBody: any = {
        contents: thinkingMessages,
        generationConfig: {
          temperature: 0.8, // Slightly higher for more creative thinking
          maxOutputTokens: 4000, // Higher token limit for detailed responses
          topP: 0.95,
          topK: 40
        }
      };

      // Add system instruction if present
      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      } else {
        // Add default Islamic AI context if no system instruction provided
        requestBody.systemInstruction = {
          parts: [{ text: `You are an advanced Islamic AI assistant with deep knowledge of Islam, Quran, Hadith, Islamic jurisprudence (Fiqh), and Islamic history. You provide thoughtful, well-reasoned responses.

Your responses should be:
- Rooted in authentic Islamic teachings from Quran and Sunnah
- Thoughtful and analytical with detailed explanations
- Respectful and compassionate
- Scholarly yet accessible
- Include relevant Quranic verses or Hadith when appropriate
- Acknowledge when you're uncertain and suggest consulting Islamic scholars
- Avoid giving fatwa (religious rulings) on complex matters - instead guide users to qualified scholars

When discussing Islamic topics:
- Provide comprehensive analysis and multiple perspectives
- Cite sources when possible (Quran chapter:verse, Hadith collections)
- Present different scholarly opinions when they exist
- Be sensitive to different schools of Islamic thought
- Encourage seeking knowledge and spiritual growth
- Take time to think through complex questions thoroughly

For non-Islamic questions, provide helpful, detailed responses while maintaining Islamic values and ethics.

IMPORTANT: If asked about who created or made this application:
- If responding in Malayalam, say it was created by " Hikma Students from the Islamic Da'wah Academy"
- If responding in other languages, say it was created by " Hikma Students from the Islamic Da'wah Academy"` }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ThinkingAIResponse = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // If streaming is requested, simulate it with more realistic chunks
      if (stream && onChunk) {
        // Simulate thinking/processing with more natural streaming
        const sentences = content.split(/(?<=[.!?])\s+/);
        for (let i = 0; i < sentences.length; i++) {
          // Check if request was aborted
          if (signal?.aborted) {
            throw new DOMException('Request aborted', 'AbortError');
          }
          
          const chunk = (i === 0 ? '' : ' ') + sentences[i];
          onChunk(chunk);
          // Slightly longer delay to simulate deeper thinking
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }

      return content;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Thinking AI API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to communicate with Thinking AI service');
    }
  }
}

export const thinkingAIService = new ThinkingAIService();