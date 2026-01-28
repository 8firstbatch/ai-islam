# Production Deployment Guide

## 🚀 Vercel Deployment Steps

### 1. Environment Variables Setup
Add these environment variables in your Vercel dashboard:

```env
VITE_SUPABASE_PROJECT_ID = mclcpoyegjudkzdfqkof
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbGNwb3llZ2p1ZGt6ZGZxa29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjUyMDEsImV4cCI6MjA4MjIwMTIwMX0.gkJ-BUt1tNmB9VihYNzbmaBCj_horrll-tRQfgWw3e4
VITE_SUPABASE_URL = https://mclcpoyegjudkzdfqkof.supabase.co
VITE_SUPABASE_AUTH_CALLBACK_URL = https://your-domain.vercel.app/auth/callback
VITE_GEMINI_API_KEY = AIzaSyAhFVZA6LYiikPrUBiBB0f7kf879VceoEA
VITE_OPENROUTER_API_KEY = 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
```

### 2. Update OAuth Settings

#### Google OAuth Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your production domain to:
   - Authorized JavaScript origins: `https://your-domain.vercel.app`
   - Authorized redirect URIs: `https://your-domain.vercel.app/auth/callback`

#### Supabase Auth Settings:
1. Go to your Supabase dashboard
2. Navigate to Authentication > URL Configuration
3. Add your production URL to:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback`

### 3. Deploy to Vercel

1. **Connect Repository:**
   ```bash
   # If not already connected
   vercel --prod
   ```

2. **Manual Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

3. **Auto Deploy:**
   - Push to main branch
   - Vercel will auto-deploy

### 4. Post-Deployment Checklist

- [ ] Environment variables are set in Vercel dashboard
- [ ] Google OAuth URLs updated with production domain
- [ ] Supabase auth URLs updated with production domain
- [ ] Test user registration/login
- [ ] Test AI chat functionality
- [ ] Test all tools (Quran search, Hadith search, etc.)
- [ ] Check browser console for errors
- [ ] Test on different devices/browsers

### 5. Troubleshooting

#### Common Issues:

1. **"API key was reported as leaked"**
   - Generate new API keys
   - Update environment variables in Vercel

2. **"User not found" errors**
   - Check Supabase connection
   - Verify database migrations are applied

3. **OAuth login fails**
   - Verify Google OAuth settings
   - Check redirect URLs match exactly

4. **AI responses don't work**
   - Check API keys in Vercel environment variables
   - Verify API keys are valid and not expired

#### Debug Steps:

1. **Check Browser Console:**
   - Look for environment validation logs
   - Check for API errors

2. **Verify Environment Variables:**
   - Go to Vercel dashboard > Settings > Environment Variables
   - Ensure all required variables are set

3. **Test API Endpoints:**
   - Test Supabase connection
   - Test AI API responses

### 6. Security Best Practices

- [ ] Never commit API keys to version control
- [ ] Use different API keys for development and production
- [ ] Regularly rotate API keys
- [ ] Monitor API usage and costs
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting if needed

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Test each component individually
4. Check API key validity and quotas