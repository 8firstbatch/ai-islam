# 🚀 Production OAuth URLs for aiislam.vercel.app

## 📋 **EXACT URLs for Google Cloud Console**

### 🌐 **Authorized JavaScript Origins**
```
https://aiislam.vercel.app
https://aiislam-git-main-mhdrazis-projects.vercel.app
https://aiislam-mhdrazis-projects.vercel.app
```

### 🔄 **Authorized Redirect URIs**
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
https://aiislam.vercel.app/auth/callback
https://aiislam-git-main-mhdrazis-projects.vercel.app/auth/callback
https://aiislam-mhdrazis-projects.vercel.app/auth/callback
```

---

## ⚙️ **Google Cloud Console Configuration**

### 1. **Go to Google Cloud Console**
- Visit: https://console.cloud.google.com/
- Navigate to: **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID and click to edit

### 2. **Add JavaScript Origins**
Copy and paste these **EXACT URLs**:
```
https://aiislam.vercel.app
https://aiislam-git-main-mhdrazis-projects.vercel.app
https://aiislam-mhdrazis-projects.vercel.app
```

### 3. **Add Redirect URIs**
Copy and paste these **EXACT URLs**:
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
https://aiislam.vercel.app/auth/callback
https://aiislam-git-main-mhdrazis-projects.vercel.app/auth/callback
https://aiislam-mhdrazis-projects.vercel.app/auth/callback
```

---

## 🗄️ **Supabase Configuration**

### 1. **Go to Supabase Dashboard**
- Visit: https://supabase.com/dashboard/project/mclcpoyegjudkzdfqkof
- Navigate to: **Authentication** → **Settings**

### 2. **Set Site URL**
```
https://aiislam.vercel.app
```

### 3. **Add Redirect URLs**
```
https://aiislam.vercel.app/auth/callback
https://aiislam.vercel.app/**
https://aiislam-git-main-mhdrazis-projects.vercel.app/auth/callback
https://aiislam-git-main-mhdrazis-projects.vercel.app/**
```

---

## 🔧 **Vercel Environment Variables**

Make sure these are set in your Vercel project settings:

```env
VITE_SUPABASE_PROJECT_ID=mclcpoyegjudkzdfqkof
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbGNwb3llZ2p1ZGt6ZGZxa29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjUyMDEsImV4cCI6MjA4MjIwMTIwMX0.gkJ-BUt1tNmB9VihYNzbmaBCj_horrll-tRQfgWw3e4
VITE_SUPABASE_URL=https://mclcpoyegjudkzdfqkof.supabase.co
VITE_SUPABASE_AUTH_CALLBACK_URL=https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
VITE_OPENROUTER_API_KEY=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
```

---

## ✅ **Quick Copy-Paste for Google OAuth**

### **JavaScript Origins (copy all 3 lines):**
```
https://aiislam.vercel.app
https://aiislam-git-main-mhdrazis-projects.vercel.app
https://aiislam-mhdrazis-projects.vercel.app
```

### **Redirect URIs (copy all 4 lines):**
```
https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback
https://aiislam.vercel.app/auth/callback
https://aiislam-git-main-mhdrazis-projects.vercel.app/auth/callback
https://aiislam-mhdrazis-projects.vercel.app/auth/callback
```

---

## 🧪 **Testing Your Setup**

1. **Visit your live site**: https://aiislam.vercel.app/
2. **Click "Sign In"** button
3. **Click "Continue with Google"**
4. **Complete Google authentication**
5. **Verify you're redirected back** to your app successfully
6. **Check that your profile image** and name are displayed

---

## 🚨 **Important Notes**

- ✅ **All URLs use HTTPS** (required for production)
- ✅ **No trailing slashes** in the URLs
- ✅ **Exact match required** - copy exactly as shown
- ✅ **Include all Vercel environments** (production, preview, development)
- ✅ **Keep Supabase callback** - this is essential for OAuth flow

---

## 🔍 **Troubleshooting**

If Google sign-in doesn't work:

1. **Check URLs match exactly** in Google Cloud Console
2. **Wait 5-10 minutes** after updating Google settings
3. **Clear browser cache** and try again
4. **Check browser console** for error messages
5. **Verify Supabase settings** are updated correctly

---

## 🎉 **Your App is Ready!**

Once configured, users can:
- ✅ Sign in with Google at https://aiislam.vercel.app/
- ✅ Get AI responses in 25+ languages
- ✅ Search Quran and Hadith
- ✅ Access prayer times and Islamic tools
- ✅ Save conversation history
- ✅ Customize their profile settings

**Your Islamic AI app is now live and ready for the Muslim community! 🕌**