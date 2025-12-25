# Google Authentication Setup Guide

This guide will help you configure Google OAuth authentication for your Islamic AI application using Supabase.

## EXACT URLs YOU NEED TO CONFIGURE

### For Google Cloud Console:

**Authorized JavaScript origins:**
```
http://localhost:8080
https://mclcpoyegjudkzdfqkof.supabase.co
```

**Authorized redirect URIs:**
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
http://localhost:8080/auth/callback
```

## Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - "Google+ API" (or "Google Identity and Access Management (IAM) API")
     - "People API" (recommended)

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name it: "Islamic AI App"

4. **Configure Authorized JavaScript origins:**
   ```
   http://localhost:8080
   https://mclcpoyegjudkzdfqkof.supabase.co
   ```

5. **Configure Authorized redirect URIs:**
   ```
   https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
   http://localhost:8080/auth/callback
   ```

6. **Save and note your credentials**
   - Copy the Client ID and Client Secret

## Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project: `mclcpoyegjudkzdfqkof`

2. **Configure Google Provider**
   - Go to "Authentication" > "Providers"
   - Find "Google" and click to configure
   - Enable the Google provider
   - Enter your Google Client ID and Client Secret from Step 1
   - **Important**: In the "Scopes" field, enter: `openid email profile`
   - This ensures we get the user's profile picture and full name

3. **Configure Site URL and Redirect URLs**
   - Go to "Authentication" > "Settings"
   - Set Site URL to: `http://localhost:8080` (for development)
   - Add redirect URLs:
     - `http://localhost:8080/auth/callback`
     - `http://localhost:8080/**` (wildcard for development)

## Step 3: Environment Variables

Your `.env` file should contain:

```env
VITE_SUPABASE_PROJECT_ID="mclcpoyegjudkzdfqkof"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key_here"
VITE_SUPABASE_URL="https://mclcpoyegjudkzdfqkof.supabase.co"
VITE_SUPABASE_AUTH_CALLBACK_URL="https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback"
```

## Step 4: Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test Google Authentication**
   - Go to `/auth` page
   - Click "Continue with Google"
   - Complete the Google OAuth flow
   - You should be redirected back to your app and logged in

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure all redirect URIs are properly configured in Google Cloud Console
   - Check that the callback URL matches exactly (including protocol and port)

2. **"Invalid client" error**
   - Verify Client ID and Client Secret are correct in Supabase
   - Ensure Google+ API is enabled

3. **Authentication not persisting**
   - Check that localStorage is enabled in your browser
   - Verify Supabase client configuration

### Debug Steps

1. **Check browser console** for any JavaScript errors
2. **Verify network requests** in browser dev tools
3. **Check Supabase logs** in the dashboard
4. **Test with different browsers** to rule out browser-specific issues

## Security Considerations

1. **Use HTTPS in production** - OAuth requires secure connections
2. **Restrict redirect URIs** - Only add necessary domains
3. **Keep credentials secure** - Never commit Client Secret to version control
4. **Regular key rotation** - Periodically update OAuth credentials

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console**
   - Add your production domain to authorized redirect URIs
   - Remove development URLs if not needed

2. **Update Supabase Settings**
   - Set production Site URL
   - Add production redirect URLs

3. **Environment Variables**
   - Ensure production environment has correct values
   - Use secure secret management for sensitive values

## Support

If you encounter issues:
- Check Supabase documentation: https://supabase.com/docs/guides/auth/social-login/auth-google
- Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
- Create an issue in the project repository