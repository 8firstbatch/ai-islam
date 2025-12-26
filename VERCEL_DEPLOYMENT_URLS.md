# 🚀 Vercel Deployment URLs for Google OAuth

## 📋 URLs for Google Cloud Console OAuth Configuration

### 🌐 **Authorized JavaScript Origins**
```
https://your-app-name.vercel.app
https://your-app-name-git-main-yourusername.vercel.app
https://your-app-name-yourusername.vercel.app
```

### 🔄 **Authorized Redirect URIs**
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
https://your-app-name.vercel.app/auth/callback
https://your-app-name-git-main-yourusername.vercel.app/auth/callback
https://your-app-name-yourusername.vercel.app/auth/callback
```

---

## 🎯 **Step-by-Step Vercel Deployment**

### 1. **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy your app
vercel --prod
```

### 2. **Get Your Vercel URLs**

After deployment, Vercel will provide you with URLs like:
- **Production**: `https://islamic-ai.vercel.app`
- **Preview**: `https://islamic-ai-git-main-username.vercel.app`
- **Development**: `https://islamic-ai-username.vercel.app`

### 3. **Update Google Cloud Console**

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Your OAuth Client ID

**Add these JavaScript Origins:**
```
https://islamic-ai.vercel.app
https://islamic-ai-git-main-username.vercel.app
https://islamic-ai-username.vercel.app
```

**Add these Redirect URIs:**
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
https://islamic-ai.vercel.app/auth/callback
https://islamic-ai-git-main-username.vercel.app/auth/callback
https://islamic-ai-username.vercel.app/auth/callback
```

### 4. **Update Supabase Settings**

Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Authentication → Settings

**Site URL:**
```
https://islamic-ai.vercel.app
```

**Redirect URLs:**
```
https://islamic-ai.vercel.app/auth/callback
https://islamic-ai.vercel.app/**
https://islamic-ai-git-main-username.vercel.app/auth/callback
https://islamic-ai-git-main-username.vercel.app/**
```

### 5. **Environment Variables in Vercel**

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
VITE_SUPABASE_PROJECT_ID=mclcpoyegjudkzdfqkof
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbGNwb3llZ2p1ZGt6ZGZxa29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjUyMDEsImV4cCI6MjA4MjIwMTIwMX0.gkJ-BUt1tNmB9VihYNzbmaBCj_horrll-tRQfgWw3e4
VITE_SUPABASE_URL=https://mclcpoyegjudkzdfqkof.supabase.co
VITE_SUPABASE_AUTH_CALLBACK_URL=https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
VITE_OPENROUTER_API_KEY=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
```

---

## 🔧 **Custom Domain Setup (Optional)**

If you want to use a custom domain like `islamicai.com`:

### 1. **Add Custom Domain in Vercel**
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Add your custom domain

### 2. **Update URLs for Custom Domain**

**JavaScript Origins:**
```
https://islamicai.com
https://www.islamicai.com
```

**Redirect URIs:**
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
https://islamicai.com/auth/callback
https://www.islamicai.com/auth/callback
```

**Supabase Site URL:**
```
https://islamicai.com
```

**Supabase Redirect URLs:**
```
https://islamicai.com/auth/callback
https://islamicai.com/**
https://www.islamicai.com/auth/callback
https://www.islamicai.com/**
```

---

## ✅ **Quick Copy-Paste Templates**

### For Google Cloud Console:

**JavaScript Origins (replace with your actual Vercel URLs):**
```
https://your-app-name.vercel.app
https://your-app-name-git-main-yourusername.vercel.app
https://your-app-name-yourusername.vercel.app
```

**Redirect URIs (replace with your actual Vercel URLs):**
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
https://your-app-name.vercel.app/auth/callback
https://your-app-name-git-main-yourusername.vercel.app/auth/callback
https://your-app-name-yourusername.vercel.app/auth/callback
```

### For Supabase Dashboard:

**Site URL:**
```
https://your-app-name.vercel.app
```

**Redirect URLs:**
```
https://your-app-name.vercel.app/auth/callback
https://your-app-name.vercel.app/**
```

---

## 🚨 **Important Notes**

1. **Replace Placeholders**: Replace `your-app-name` and `yourusername` with your actual Vercel project name and username
2. **HTTPS Only**: All production URLs must use HTTPS
3. **Exact Match**: URLs must match exactly (no trailing slashes unless specified)
4. **Multiple Environments**: Include all Vercel environments (production, preview, development)
5. **Supabase Callback**: Always keep the Supabase callback URL: `https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback`

---

## 🔍 **Testing Your Deployment**

1. **Deploy to Vercel**: `vercel --prod`
2. **Get your actual URLs** from Vercel dashboard
3. **Update Google OAuth** with real URLs
4. **Update Supabase settings** with real URLs
5. **Test Google sign-in** on your live site
6. **Check browser console** for any errors
7. **Verify redirect flow** works correctly

---

## 🆘 **Troubleshooting**

### Common Issues:
- **redirect_uri_mismatch**: URLs don't match exactly
- **origin_mismatch**: JavaScript origins not configured
- **CORS errors**: Supabase site URL not set correctly

### Solutions:
- Double-check all URLs are exactly the same
- Ensure HTTPS is used for all production URLs
- Wait a few minutes after updating Google settings
- Clear browser cache and try again