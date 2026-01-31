/**
 * Fast AI model configurations optimized for speed
 */

export interface FastModelConfig {
  id: string;
  name: string;
  provider: 'openrouter' | 'google';
  model: string;
  speed: 'fastest' | 'fast' | 'balanced';
  description: string;
}

export const FAST_MODELS: FastModelConfig[] = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'Fast (GPT-4o Mini)',
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    speed: 'fastest',
    description: 'Fastest OpenAI model at 4x speed, optimized for rapid responses'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Thinking (Gemini Flash)',
    provider: 'google',
    model: 'gemini-2.5-flash',
    speed: 'fast',
    description: 'Google\'s thinking model at 1.5x speed with excellent reasoning capabilities'
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Pro Model (Gemini Pro)',
    provider: 'google',
    model: 'gemini-2.5-pro',
    speed: 'balanced',
    description: 'Google\'s most capable model for complex tasks'
  }
];

export const getFastestModel = (): FastModelConfig => {
  return FAST_MODELS.find(m => m.speed === 'fastest') || FAST_MODELS[0];
};

export const getModelBySpeed = (speed: 'fastest' | 'fast' | 'balanced'): FastModelConfig[] => {
  return FAST_MODELS.filter(m => m.speed === speed);
};

export const getOptimizedSettings = (modelId: string) => {
  const baseSettings = {
    temperature: 0.7,
    stream: true,
    max_tokens: 1500, // Reduced for speed
  };

  switch (modelId) {
    case 'openai/gpt-4o-mini':
      return {
        ...baseSettings,
        top_p: 0.9,
        frequency_penalty: 0.1,
        // Fast mode settings for 4x speed
        stream_delay: 0, // No artificial delay
        chunk_size: 'large', // Larger chunks for faster delivery
      };
    
    case 'google/gemini-2.5-flash':
      return {
        ...baseSettings,
        topP: 0.9,
        topK: 40,
        // Thinking mode settings for 1.5x speed
        stream_delay: 33, // 1.5x faster than normal (50ms / 1.5 ≈ 33ms)
        chunk_size: 'medium', // Medium chunks for balanced delivery
      };

    case 'google/gemini-2.5-pro':
      return {
        ...baseSettings,
        topP: 0.95,
        topK: 40,
        max_tokens: 2500, // Higher for pro model
      };
    
    default:
      return baseSettings;
  }
};