/**
 * Simple production readiness test
 * Run this to verify everything is configured correctly
 */

export const testProductionReadiness = () => {
  console.log('🧪 Testing Production Readiness...');
  
  const tests = [
    {
      name: 'Supabase URL',
      test: () => !!import.meta.env.VITE_SUPABASE_URL,
      value: import.meta.env.VITE_SUPABASE_URL
    },
    {
      name: 'Supabase Key',
      test: () => !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      value: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✓ Present' : '✗ Missing'
    },
    {
      name: 'Gemini API Key',
      test: () => !!import.meta.env.VITE_GEMINI_API_KEY,
      value: import.meta.env.VITE_GEMINI_API_KEY ? '✓ Present' : '✗ Missing'
    },
    {
      name: 'OpenRouter API Key',
      test: () => !!import.meta.env.VITE_OPENROUTER_API_KEY,
      value: import.meta.env.VITE_OPENROUTER_API_KEY ? '✓ Present' : '✗ Missing'
    }
  ];

  let allPassed = true;
  
  tests.forEach(test => {
    const passed = test.test();
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${test.value}`);
    if (!passed) allPassed = false;
  });

  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ READY FOR PRODUCTION' : '❌ NOT READY - Fix issues above'}`);
  
  return allPassed;
};