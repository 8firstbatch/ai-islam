import { testAllApiKeys } from './apiKeyTest';

/**
 * Comprehensive debug test for all fixed issues
 * Run this to verify all fixes are working
 */

export const runDebugTest = async () => {
  console.log('🔧 RUNNING COMPREHENSIVE DEBUG TEST...\n');

  // Test 1: Environment Variables
  console.log('1️⃣ TESTING ENVIRONMENT VARIABLES:');
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  console.log(`   Gemini API Key: ${geminiKey ? (geminiKey.startsWith('AIzaSy') ? '✅ Valid format' : '❌ Invalid format') : '❌ Missing'}`);
  console.log(`   OpenRouter Key: ${openRouterKey ? (openRouterKey.startsWith('sk-or-v1-') ? '✅ Valid format' : '❌ Invalid format') : '❌ Missing'}`);
  console.log(`   Supabase URL: ${supabaseUrl ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Supabase Key: ${supabaseKey ? '✅ Present' : '❌ Missing'}\n`);

  // Test 2: API Key Validity
  console.log('2️⃣ TESTING API KEY VALIDITY:');
  await testAllApiKeys();

  // Test 3: API Services
  console.log('\n3️⃣ TESTING API SERVICES:');
  try {
    // Test Google AI Service
    import('../services/googleAIService').then(({ googleAIService }) => {
      console.log('   Google AI Service: ✅ Loaded successfully');
    }).catch(() => {
      console.log('   Google AI Service: ❌ Failed to load');
    });

    // Test OpenRouter Service
    import('../services/openRouterService').then(({ openRouterService }) => {
      console.log('   OpenRouter Service: ✅ Loaded successfully');
    }).catch(() => {
      console.log('   OpenRouter Service: ❌ Failed to load');
    });
  } catch (error) {
    console.log('   API Services: ❌ Error loading services');
  }

  // Test 4: Supabase Connection
  console.log('\n4️⃣ TESTING SUPABASE CONNECTION:');
  import('../integrations/supabase/client').then(({ supabase }) => {
    console.log('   Supabase Client: ✅ Loaded successfully');
    
    // Test a simple query without is_pro_enabled column
    supabase.from('user_settings').select('ai_model').limit(1).then(({ error }) => {
      if (error) {
        console.log(`   Database Query: ❌ Error - ${error.message}`);
      } else {
        console.log('   Database Query: ✅ Connection successful');
      }
    });
  }).catch(() => {
    console.log('   Supabase Client: ❌ Failed to load');
  });

  // Test 5: Auth Context
  console.log('\n5️⃣ TESTING AUTH CONTEXT:');
  try {
    import('../contexts/AuthContext').then(() => {
      console.log('   Auth Context: ✅ Loaded successfully');
    }).catch(() => {
      console.log('   Auth Context: ❌ Failed to load');
    });
  } catch (error) {
    console.log('   Auth Context: ❌ Error loading');
  }

  console.log('\n🎯 DEBUG TEST COMPLETE!');
  console.log('Check the results above to identify any remaining issues.\n');
};

// Auto-run in development
if (import.meta.env.DEV) {
  setTimeout(runDebugTest, 1000);
}