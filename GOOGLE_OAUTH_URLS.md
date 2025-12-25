# Google OAuth Configuration URLs

## For Google Cloud Console OAuth Client ID

### Authorized JavaScript origins:
```
http://localhost:8080
https://mclcpoyegjudkzdfqkof.supabase.co
```

### Authorized redirect URIs:
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
http://localhost:8080/auth/callback
```

## For Supabase Dashboard

### Authentication > Settings:
- **Site URL:** `http://localhost:8080`

### Authentication > Settings > Redirect URLs:
```
http://localhost:8080/auth/callback
http://localhost:8080/**
```

## Quick Setup Steps:

1. **Google Cloud Console:**
   - Go to APIs & Services > Credentials
   - Create OAuth client ID (Web application)
   - Add the JavaScript origins and redirect URIs above
   - Copy Client ID and Client Secret

2. **Supabase Dashboard:**
   - Go to Authentication > Providers
   - Enable Google provider
   - Enter Client ID and Client Secret
   - Go to Authentication > Settings
   - Set Site URL and add redirect URLs above

3. **Test:**
   - Start dev server: `npm run dev`
   - Go to `http://localhost:8080/auth`
   - Click "Continue with Google"