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
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    speed: 'fastest',
    description: 'Fastest OpenAI model, optimized for speed'
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    model: 'gemini-2.5-flash',
    speed: 'fastest',
    description: 'Google\'s fastest model, excellent for quick responses'
  },
  {
    id: 'claude-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'openrouter',
    model: 'anthropic/claude-3.5-haiku',
    speed: 'fast',
    description: 'Anthropic\'s fastest model'
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'openrouter',
    model: 'meta-llama/llama-3.1-8b-instruct',
    speed: 'fast',
    description: 'Fast open-source model'
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
    case 'gpt-4o-mini':
      return {
        ...baseSettings,
        top_p: 0.9,
        frequency_penalty: 0.1,
      };
    
    case 'gemini-flash':
      return {
        ...baseSettings,
        topP: 0.9,
        topK: 40,
      };
    
    case 'claude-haiku':
      return {
        ...baseSettings,
        top_p: 0.9,
      };
    
    default:
      return baseSettings;
  }
};