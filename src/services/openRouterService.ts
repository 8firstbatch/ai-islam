import { supabase } from "@/integrations/supabase/client";

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
    delta?: {
      content?: string;
    };
  }>;
}

export class OpenRouterService {
  private apiKey: string;
  private proApiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    this.proApiKey = "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";
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file');
    }
  }

  private async getEffectiveApiKey(userId?: string): Promise<string> {
    if (!userId) {
      return this.apiKey;
    }

    try {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Check if is_pro_enabled column exists and is true
      if (data && 'is_pro_enabled' in data && data.is_pro_enabled) {
        return this.proApiKey;
      }
    } catch (error: any) {
      console.warn('Failed to check Pro status:', error?.message || error);
      // If it's a user not found error, that's okay - user might not have settings yet
      if (error?.code === 'PGRST116') {
        console.log('User settings not found, using default API key');
      }
    }

    return this.apiKey;
  }

  async sendMessage(
    messages: OpenRouterMessage[],
    options: {
      model?: string;
      stream?: boolean;
      onChunk?: (chunk: string) => void;
      signal?: AbortSignal;
      userId?: string;
    } = {}
  ): Promise<string> {
    const {
      model = 'openai/gpt-4o-mini', // Default to a cost-effective model
      stream = true,
      onChunk,
      signal,
      userId
    } = options;

    const effectiveApiKey = await this.getEffectiveApiKey(userId);
    
    if (!effectiveApiKey) {
      throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file');
    }

    // Add Islamic context to the system message
    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: `You are an Islamic AI assistant with deep knowledge of Islam, Quran, Hadith, Islamic jurisprudence (Fiqh), and Islamic history. 

Your responses should be:
- Rooted in authentic Islamic teachings from Quran and Sunnah
- Respectful and compassionate
- Scholarly yet accessible
- Include relevant Quranic verses or Hadith when appropriate
- Acknowledge when you're uncertain and suggest consulting Islamic scholars
- Avoid giving fatwa (religious rulings) on complex matters - instead guide users to qualified scholars
- Automatically detect the user's language and respond in the same language they used

When discussing Islamic topics:
- Cite sources when possible (Quran chapter:verse, Hadith collections)
- Present different scholarly opinions when they exist
- Be sensitive to different schools of Islamic thought
- Encourage seeking knowledge and spiritual growth

Language Detection:
- Automatically detect if the user is writing in English, Arabic, Malayalam, or Manglish (Malayalam-English mix)
- Respond in the same language the user used in their message
- For Arabic: Use proper Arabic script (العربية)
- For Malayalam: Use Malayalam script (മലയാളം)
- For Manglish: Use natural Malayalam-English mix with Malayalam words in English script
- For English: Use clear, proper English

For non-Islamic questions, provide helpful responses while maintaining Islamic values and ethics.`
    };

    const requestMessages = [systemMessage, ...messages];

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Islam - Islamic AI Assistant'
        },
        body: JSON.stringify({
          model,
          messages: requestMessages,
          stream,
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (stream) {
        return this.handleStreamResponse(response, onChunk);
      } else {
        const data: OpenRouterResponse = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error; // Re-throw abort errors
      }
      console.error('OpenRouter API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to communicate with AI service');
    }
  }

  private async handleStreamResponse(
    response: Response,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          // Clean up the line
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const contentChunk = parsed.choices?.[0]?.delta?.content;
            
            if (contentChunk) {
              fullContent += contentChunk;
              onChunk?.(contentChunk);
            }
          } catch (parseError) {
            // If we can't parse this chunk, put it back in the buffer
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  // Get available models (optional - for future use)
  async getModels(userId?: string): Promise<any[]> {
    try {
      const effectiveApiKey = await this.getEffectiveApiKey(userId);
      
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${effectiveApiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }
}

export const openRouterService = new OpenRouterService();