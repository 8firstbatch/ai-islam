interface GoogleAIMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GoogleAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export class GoogleAIService {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    // Use the provided Google API key for AI chatting
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Validate API key
    if (!this.apiKey || this.apiKey.includes('YOUR_NEW_GEMINI_API_KEY_HERE')) {
      console.error('❌ Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables');
    } else if (!this.apiKey.startsWith('AIzaSy')) {
      console.error('❌ Invalid Gemini API key format. Key should start with "AIzaSy"');
    } else {
      console.log('✅ Gemini API key configured successfully');
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
      model = 'gemini-2.5-flash',
      stream = false,
      onChunk,
      signal
    } = options;

    // Convert messages to Google AI format
    const googleMessages: GoogleAIMessage[] = [];
    let systemInstruction = '';

    for (const message of messages) {
      if (message.role === 'system') {
        systemInstruction = message.content;
      } else {
        googleMessages.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }]
        });
      }
    }

    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables');
      }

      const url = `${this.baseURL}/models/${model}:generateContent?key=${this.apiKey}`;
      
      const requestBody: any = {
        contents: googleMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
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
          parts: [{ text: `You are an Islamic AI assistant with deep knowledge of Islam, Quran, Hadith, Islamic jurisprudence (Fiqh), and Islamic history. 

Your responses should be:
- Rooted in authentic Islamic teachings from Quran and Sunnah
- Respectful and compassionate
- Scholarly yet accessible
- Include relevant Quranic verses or Hadith when appropriate
- Acknowledge when you're uncertain and suggest consulting Islamic scholars
- Avoid giving fatwa (religious rulings) on complex matters - instead guide users to qualified scholars

When discussing Islamic topics:
- Cite sources when possible (Quran chapter:verse, Hadith collections)
- Present different scholarly opinions when they exist
- Be sensitive to different schools of Islamic thought
- Encourage seeking knowledge and spiritual growth

For non-Islamic questions, provide helpful responses while maintaining Islamic values and ethics.` }]
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
        const errorText = await response.text();
        console.error('Google AI API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        if (response.status === 400) {
          throw new Error('Google AI API request error. Please check your request format');
        } else if (response.status === 401) {
          throw new Error('Google AI API key is invalid or expired. Please check your VITE_GEMINI_API_KEY');
        } else if (response.status === 403) {
          throw new Error('Google AI API access forbidden. Please check your API key permissions');
        } else if (response.status === 429) {
          throw new Error('Google AI API rate limit exceeded. Please try again later');
        } else {
          throw new Error(`Google AI API error (${response.status}): ${errorText}`);
        }
      }

      const data: GoogleAIResponse = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // If streaming is requested, simulate it by calling onChunk with chunks
      if (stream && onChunk) {
        // Simulate streaming by sending word chunks
        const words = content.split(' ');
        for (let i = 0; i < words.length; i++) {
          // Check if request was aborted
          if (signal?.aborted) {
            throw new DOMException('Request aborted', 'AbortError');
          }
          
          const chunk = (i === 0 ? '' : ' ') + words[i];
          onChunk(chunk);
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      return content;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Google AI API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to communicate with Google AI service');
    }
  }
}

export const googleAIService = new GoogleAIService();