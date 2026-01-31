/**
 * AI Response Speed Testing Utility
 */

import { openRouterService } from '@/services/openRouterService';
import { googleAIService } from '@/services/googleAIService';

export interface SpeedTestResult {
  model: string;
  provider: string;
  responseTime: number;
  tokensPerSecond?: number;
  success: boolean;
  error?: string;
}

export const testModelSpeed = async (
  model: string,
  provider: 'openrouter' | 'google',
  testMessage: string = "Hello, how are you?"
): Promise<SpeedTestResult> => {
  const startTime = Date.now();
  
  try {
    const messages = [{ role: 'user' as const, content: testMessage }];
    
    if (provider === 'google') {
      await googleAIService.sendMessage(messages, {
        model: model,
        stream: false, // Disable streaming for accurate timing
      });
    } else {
      await openRouterService.sendMessage(messages, {
        model: model,
        stream: false,
      });
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      model,
      provider,
      responseTime,
      success: true,
    };
  } catch (error) {
    return {
      model,
      provider,
      responseTime: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const runSpeedBenchmark = async (): Promise<SpeedTestResult[]> => {
  console.log('🏃‍♂️ Running AI Speed Benchmark...');
  
  const testModels = [
    { model: 'gemini-2.5-flash', provider: 'google' as const },
    { model: 'openai/gpt-4o-mini', provider: 'openrouter' as const },
    { model: 'anthropic/claude-3.5-haiku', provider: 'openrouter' as const },
  ];
  
  const results: SpeedTestResult[] = [];
  
  for (const { model, provider } of testModels) {
    console.log(`Testing ${model}...`);
    const result = await testModelSpeed(model, provider);
    results.push(result);
    console.log(`${model}: ${result.success ? `${result.responseTime}ms` : 'Failed'}`);
  }
  
  // Sort by response time (fastest first)
  results.sort((a, b) => a.responseTime - b.responseTime);
  
  console.log('🏆 Speed Benchmark Results:');
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`${index + 1}. ${result.model}: ${result.responseTime}ms`);
    }
  });
  
  return results;
};

export const getFastestModel = async (): Promise<string> => {
  const results = await runSpeedBenchmark();
  const fastest = results.find(r => r.success);
  return fastest?.model || 'gemini-2.5-flash'; // Default fallback
};