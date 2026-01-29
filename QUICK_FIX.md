# 🚀 QUICK FIX - Get Your Website Working in Production

## ⚡ IMMEDIATE STEPS (5 minutes)

### Step 1: Go to Vercel Dashboard
1. Open [vercel.com](https://vercel.com) in your browser
2. Sign in to your account
3. Find your project and click on it

### Step 2: Add Environment Variables
1. Click **"Settings"** tab
2. Click **"Environment Variables"** in the left sidebar
3. Add these **EXACT** variables (copy-paste each one):

**Variable 1:**
- Name: `VITE_SUPABASE_PROJECT_ID`
- Value: `mclcpoyegjudkzdfqkof`

**Variable 2:**
- Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbGNwb3llZ2p1ZGt6ZGZxa29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjUyMDEsImV4cCI6MjA4MjIwMTIwMX0.gkJ-BUt1tNmB9VihYNzbmaBCj_horrll-tRQfgWw3e4`

**Variable 3:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://mclcpoyegjudkzdfqkof.supabase.co`

**Variable 4:**
- Name: `VITE_GEMINI_API_KEY`
- Value: `AIzaSyAhFVZA6LYiikPrUBiBB0f7kf879VceoEA`

**Variable 5:**
- Name: `VITE_OPENROUTER_API_KEY`
- Value: `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`

**Variable 6:**
- Name: `VITE_SUPABASE_AUTH_CALLBACK_URL`
- Value: `https://YOUR-DOMAIN.vercel.app/auth/callback` (replace YOUR-DOMAIN with your actual domain)

### Step 3: Redeploy
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for deployment to complete (2-3 minutes)

### Step 4: Test
1. Open your production website
2. Try to chat with AI
3. Should work now!

---

## 🔧 IF STILL NOT WORKING

### Check Browser Console:
1. Press F12 in your browser
2. Go to "Console" tab
3. Look for any red errors
4. Share the errors with me

### Common Issues:

**Issue 1: OAuth Login Fails**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Add your production domain to OAuth settings

**Issue 2: Still Getting API Errors**
- Double-check all environment variables are exactly as shown above
- Make sure there are no extra spaces or quotes

**Issue 3: Database Errors**
- Check if Supabase is working by going to your Supabase dashboard

---

## ✅ SUCCESS CHECKLIST

After following the steps above, you should be able to:
- [ ] Visit your production website
- [ ] Sign in with Google
- [ ] Send a message to AI and get a response
- [ ] Use all the Islamic tools (Quran search, etc.)

If any of these don't work, let me know which specific step fails!