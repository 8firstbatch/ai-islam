/**
 * Test API keys to verify they're working
 */

export const testOpenRouterKey = async () => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No OpenRouter API key found');
    return false;
  }

  try {
    console.log('🧪 Testing OpenRouter API key...');
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      console.log('✅ OpenRouter API key is valid');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ OpenRouter API key test failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ OpenRouter API key test error:', error);
    return false;
  }
};

export const testGeminiKey = async () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No Gemini API key found');
    return false;
  }

  try {
    console.log('🧪 Testing Gemini API key...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
    });

    if (response.ok) {
      console.log('✅ Gemini API key is valid');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Gemini API key test failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Gemini API key test error:', error);
    return false;
  }
};

export const testAllApiKeys = async () => {
  console.log('🔑 TESTING ALL API KEYS...\n');
  
  const openRouterValid = await testOpenRouterKey();
  const geminiValid = await testGeminiKey();
  
  console.log('\n📊 API KEY TEST RESULTS:');
  console.log(`OpenRouter: ${openRouterValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`Gemini: ${geminiValid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (openRouterValid && geminiValid) {
    console.log('\n🎉 All API keys are working!');
  } else {
    console.log('\n⚠️ Some API keys need attention');
  }
  
  return { openRouterValid, geminiValid };
};