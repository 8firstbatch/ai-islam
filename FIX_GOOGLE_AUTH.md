# Fix Google Auth - Step by Step

## The Error You're Getting
`Error 400: redirect_uri_mismatch` means Google doesn't recognize your callback URL.

## EXACT STEPS TO FIX:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project (or create one)

### 2. Go to Credentials
- Navigate to: **APIs & Services** > **Credentials**
- Find your OAuth 2.0 Client ID (or create one if you don't have it)
- Click on it to edit

### 3. Add These EXACT URLs:

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

### 4. Copy Your Credentials
- Copy the **Client ID** and **Client Secret**

### 5. Configure Supabase
- Go to: https://supabase.com/dashboard/project/mclcpoyegjudkzdfqkof
- Navigate to: **Authentication** > **Providers**
- Find **Google** and click to configure
- Paste your **Client ID** and **Client Secret**
- Enable the provider

### 6. Set Supabase Site URL
- In Supabase, go to: **Authentication** > **Settings**
- Set **Site URL** to: `http://localhost:8080`
- Add these **Redirect URLs**:
  ```
  http://localhost:8080/auth/callback
  http://localhost:8080/**
  ```

### 7. Test It
- Start your dev server: `npm run dev`
- Go to: http://localhost:8080/auth
- Click "Continue with Google"
- Use the debug tool on the page to verify configuration

## Debug Tool
I've added a debug tool to your auth page. Use it to:
- Check your current configuration
- Test the OAuth flow
- See what URLs are being used

## Common Issues:
1. **URLs must match EXACTLY** - no extra slashes, wrong ports, etc.
2. **Wait a few minutes** after changing Google settings
3. **Clear browser cache** if you're still getting errors
4. **Check browser console** for additional error details

## Your Current Setup:
- Dev server: `http://localhost:8080`
- Callback: `http://localhost:8080/auth/callback`
- Supabase: `https://mclcpoyegjudkzdfqkof.supabase.co`