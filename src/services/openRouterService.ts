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
    this.proApiKey = import.meta.env.VITE_OPENROUTER_PRO_API_KEY || this.apiKey;
    
    // Validate API key format and provide helpful feedback
    if (!this.apiKey || this.apiKey.includes('your_openrouter_api_key_here')) {
      console.error('❌ OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables');
    } else if (!this.apiKey.startsWith('sk-or-v1-')) {
      console.error('❌ Invalid OpenRouter API key format. Key should start with "sk-or-v1-"');
    } else {
      console.log('✅ OpenRouter API key configured successfully');
    }
  }

  private async getEffectiveApiKey(userId?: string): Promise<string> {
    // For now, always use the regular API key to avoid database issues
    // Pro key logic can be implemented later when user_settings are stable
    if (!this.apiKey || this.apiKey.includes('your_openrouter_api_key_here')) {
      throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables');
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
      fastMode?: boolean;
      thinkingMode?: boolean;
    } = {}
  ): Promise<string> {
    const {
      model = 'openai/gpt-4o-mini', // Fast and cost-effective model
      stream = true, // Enable streaming for better user experience
      onChunk,
      signal,
      userId,
      fastMode = false,
      thinkingMode = false
    } = options;

    const effectiveApiKey = await this.getEffectiveApiKey(userId);
    
    if (!effectiveApiKey) {
      throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file');
    }

    // Optimized Islamic context - shorter for faster processing
    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: `You are an Islamic AI assistant. Provide authentic Islamic guidance from Quran and Sunnah. Be concise, respectful, and cite sources when possible. Respond in the user's language.

IMPORTANT: If asked about who created or made this application:
- If responding in Malayalam, say it was created by " Hikma Students from the Islamic Da'wah Academy"
- If responding in other languages, say it was created by " Hikma Students from the Islamic Da'wah Academy"`
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
          max_tokens: 1500, // Reduced for faster responses
          top_p: 0.9, // Optimize for speed
        }),
        signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        // Provide specific error messages based on status code
        if (response.status === 401) {
          throw new Error('OpenRouter API key is invalid or expired. Please check your VITE_OPENROUTER_API_KEY environment variable');
        } else if (response.status === 402) {
          throw new Error('OpenRouter account has insufficient credits. Please add credits to your OpenRouter account');
        } else if (response.status === 429) {
          throw new Error('OpenRouter rate limit exceeded. Please try again in a few moments');
        } else if (response.status === 400) {
          throw new Error(`OpenRouter API request error: ${errorText}`);
        } else {
          throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
        }
      }

      if (stream) {
        return this.handleStreamResponse(response, onChunk, fastMode, thinkingMode);
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
    onChunk?: (chunk: string) => void,
    fastMode: boolean = false,
    thinkingMode: boolean = false
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
              if (onChunk) {
                if (fastMode) {
                  // In fast mode, send chunks immediately without delay
                  onChunk(contentChunk);
                } else if (thinkingMode) {
                  // In thinking mode, add slight delay for 1.5x speed
                  onChunk(contentChunk);
                  await new Promise(resolve => setTimeout(resolve, 7)); // 1.5x speed (10ms / 1.5 ≈ 7ms)
                } else {
                  // Normal mode with slight delay for better UX
                  onChunk(contentChunk);
                  await new Promise(resolve => setTimeout(resolve, 10));
                }
              }
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