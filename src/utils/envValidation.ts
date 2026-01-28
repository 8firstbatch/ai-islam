/**
 * Environment variable validation utility
 * Helps debug production deployment issues
 */

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_GEMINI_API_KEY: string;
  VITE_OPENROUTER_API_KEY: string;
}

export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required environment variables
  const requiredVars: (keyof EnvConfig)[] = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_GEMINI_API_KEY',
    'VITE_OPENROUTER_API_KEY'
  ];

  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value) {
      errors.push(`Missing environment variable: ${varName}`);
    } else if (value.includes('your_') || value.includes('YOUR_')) {
      errors.push(`Placeholder value detected for: ${varName}`);
    }
  });

  // Validate specific formats
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  }

  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY appears to be invalid');
  }

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey && !geminiKey.startsWith('AIzaSy')) {
    errors.push('VITE_GEMINI_API_KEY appears to be invalid');
  }

  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (openRouterKey && !openRouterKey.startsWith('sk-or-v1-')) {
    errors.push('VITE_OPENROUTER_API_KEY appears to be invalid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const logEnvironmentStatus = () => {
  const { isValid, errors } = validateEnvironment();
  
  console.log('🔧 Environment Validation:');
  console.log('- Mode:', import.meta.env.MODE);
  console.log('- Production:', import.meta.env.PROD);
  console.log('- Valid:', isValid);
  
  if (!isValid) {
    console.error('❌ Environment Issues:');
    errors.forEach(error => console.error(`  - ${error}`));
  } else {
    console.log('✅ All environment variables are properly configured');
  }
};