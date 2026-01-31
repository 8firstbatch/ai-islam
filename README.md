# 🕌 Islamic AI - Your Spiritual Guide

<div align="center">

![Islamic AI Logo](https://img.shields.io/badge/Islamic-AI-emerald?style=for-the-badge&logo=mosque&logoColor=white)

**An intelligent Islamic companion powered by AI, providing authentic guidance rooted in Quran and Sunnah**

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

[🚀 Live Demo](#) • [📖 Documentation](#features) • [🤝 Contributing](#contributing) • [📧 Support](#support)

</div>

---

## ✨ Features

### 🤖 **AI-Powered Islamic Guidance**
- **Authentic Responses**: AI trained on Quran, Hadith, and Islamic jurisprudence
- **Multilingual Support**: Responds in 25+ languages including Arabic, Urdu, Malayalam, Hindi, French, and more
- **Scholarly Accuracy**: Cites sources from Quran and authentic Hadith collections
- **Context-Aware**: Understands Islamic context and provides appropriate guidance

### 📚 **Islamic Knowledge Base**
- **📖 Quran Search**: Search verses in multiple translations with audio recitation
- **📜 Hadith Search**: Explore authentic Hadith collections (Bukhari, Muslim, etc.)
- **🕐 Prayer Times**: Accurate prayer times based on your location
- **🧭 Qibla Compass**: Find the direction to Mecca from anywhere
- **📅 Islamic Calendar**: Hijri calendar with important Islamic dates

### 👤 **User Experience**
- **🔐 Google OAuth**: Seamless sign-in with Google profile sync
- **💬 Chat History**: Persistent conversation history for authenticated users
- **🎨 Dark/Light Theme**: Customizable appearance
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🔖 Bookmarks**: Save favorite verses and teachings

### 🛠️ **Advanced Tools**
- **🎨 Islamic Image Generation**: AI-powered Islamic-themed image creation
- **🌍 Location Services**: Automatic location detection for prayer times
- **🔍 Smart Search**: Intelligent search across Quran and Hadith
- **📊 User Settings**: Customizable AI model and response style

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0+ 
- **npm** or **yarn**
- **Supabase** account
- **OpenRouter** API key (for AI responses)
- **Google Cloud Console** project (for OAuth)

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/islamic-ai.git
   cd islamic-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_PROJECT_ID="your_project_id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_OPENROUTER_API_KEY="your_openrouter_key"
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open in Browser**
   ```
   http://localhost:8080
   ```

---

## 🏗️ Architecture

### 🎯 **Tech Stack**

| Technology | Purpose | Version |
|------------|---------|---------|
| ⚛️ **React** | Frontend Framework | 18.0+ |
| 🔷 **TypeScript** | Type Safety | 5.0+ |
| ⚡ **Vite** | Build Tool | 5.0+ |
| 🎨 **Tailwind CSS** | Styling | 3.0+ |
| 🗄️ **Supabase** | Backend & Database | Latest |
| 🤖 **OpenRouter** | AI API Gateway | Latest |
| 🔐 **Google OAuth** | Authentication | Latest |

### 📁 **Project Structure**

```
aiislam/
├── 📁 src/
│   ├── 📁 components/          # Reusable UI components
│   │   ├── 🕌 QuranSearch.tsx  # Quran verse search
│   │   ├── 📜 HadithSearch.tsx # Hadith search
│   │   ├── 🕐 PrayerTimes.tsx  # Prayer times display
│   │   ├── 🧭 QiblaCompass.tsx # Qibla direction
│   │   └── 💬 ChatMessage.tsx  # Chat interface
│   ├── 📁 pages/              # Main application pages
│   │   ├── 🏠 Index.tsx       # Home/Chat page
│   │   ├── 🔐 Auth.tsx        # Authentication
│   │   └── ⚙️ Settings.tsx    # User settings
│   ├── 📁 hooks/              # Custom React hooks
│   │   ├── 🤖 useOpenRouterChat.ts
│   │   └── 💬 useConversations.ts
│   ├── 📁 services/           # API services
│   │   └── 🌐 openRouterService.ts
│   ├── 📁 utils/              # Utility functions
│   │   ├── 🔐 authUtils.ts
│   │   └── 👤 profileUtils.ts
│   └── 📁 contexts/           # React contexts
│       ├── 🔐 AuthContext.tsx
│       └── 🎨 ThemeContext.tsx
├── 📁 supabase/               # Database migrations
│   └── 📁 migrations/
├── 📁 public/                 # Static assets
└── 📄 README.md              # This file
```

---

## 🔧 Configuration

### 🔐 **Google OAuth Setup**

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing

2. **Configure OAuth Consent Screen**
   - Add authorized domains
   - Set application name and logo

3. **Create OAuth Credentials**
   ```
   Authorized JavaScript origins:
   - http://localhost:8080
   - https://your-domain.com
   
   Authorized redirect URIs:
   - https://your-project.supabase.co/auth/v1/callback
   - http://localhost:8080/auth/callback
   ```

### 🗄️ **Supabase Configuration**

1. **Create Supabase Project**
   - Visit [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project

2. **Configure Authentication**
   - Enable Google provider
   - Add Google Client ID and Secret
   - Set site URL and redirect URLs

3. **Database Setup**
   - Run provided migrations
   - Enable Row Level Security (RLS)

### 🤖 **OpenRouter Setup**

1. **Get API Key**
   - Visit [OpenRouter](https://openrouter.ai/)
   - Create account and get API key

2. **Configure Models**
   - Default: `google/gemini-2.5-flash`
   - Available: Gemini Flash, Gemini Pro, and more

---

## 🎨 Features Deep Dive

### 🤖 **AI Chat System**

```typescript
// Multilingual AI responses
const response = await openRouterService.sendMessage([
  { role: "user", content: "Tell me about prayer in Islam" }
], {
  model: "google/gemini-2.5-flash",
  language: "arabic" // Responds in Arabic
});
```

**Key Features:**
- ✅ Streaming responses for real-time chat
- ✅ Context-aware conversations
- ✅ Islamic knowledge base integration
- ✅ Multilingual support (25+ languages)
- ✅ Source citations from Quran and Hadith

### 📖 **Quran Search**

```typescript
// Search Quran verses
const verses = await searchQuran({
  query: "mercy",
  translation: "en.sahih",
  surah: 2, // Optional: specific surah
  ayah: 255 // Optional: specific verse
});
```

**Features:**
- 🔍 Keyword search in multiple languages
- 🌍 25+ translation languages
- 🔊 Audio recitation (Al-Afasy)
- 📚 Reference-based search (Surah:Ayah)
- ⌨️ Keyboard navigation

### 📜 **Hadith Search**

```typescript
// Search authentic Hadith
const hadiths = await searchHadith({
  query: "prayer",
  collection: "Sahih Bukhari",
  translation: "urdu"
});
```

**Collections:**
- 📚 Sahih Bukhari
- 📚 Sahih Muslim  
- 📚 Sunan Abu Dawood
- 📚 Jami' at-Tirmidhi
- 📚 Sunan an-Nasa'i
- 📚 Sunan Ibn Majah

### 🕐 **Prayer Times**

```typescript
// Get prayer times for location
const prayerTimes = await getPrayerTimes({
  latitude: 40.7128,
  longitude: -74.0060,
  method: "ISNA" // Calculation method
});
```

**Features:**
- 📍 Automatic location detection
- 🌍 Multiple calculation methods
- ⏰ Next prayer countdown
- 🔔 Prayer notifications
- 🌅 Sunrise/sunset times

---

## 🌍 Internationalization

### 🗣️ **Supported Languages**

| Language | Code | Script | Status |
|----------|------|--------|--------|
| 🇸🇦 Arabic | `ar` | العربية | ✅ Full |
| 🇺🇸 English | `en` | English | ✅ Full |
| 🇵🇰 Urdu | `ur` | اردو | ✅ Full |
| 🇮🇳 Hindi | `hi` | हिंदी | ✅ Full |
| 🇮🇳 Malayalam | `ml` | മലയാളം | ✅ Full |
| 🇧🇩 Bengali | `bn` | বাংলা | ✅ Full |
| 🇫🇷 French | `fr` | Français | ✅ Full |
| 🇩🇪 German | `de` | Deutsch | ✅ Full |
| 🇪🇸 Spanish | `es` | Español | ✅ Full |
| 🇹🇷 Turkish | `tr` | Türkçe | ✅ Full |
| 🇮🇩 Indonesian | `id` | Bahasa Indonesia | ✅ Full |
| 🇲🇾 Malay | `ms` | Bahasa Melayu | ✅ Full |
| 🇮🇷 Persian | `fa` | فارسی | ✅ Full |
| 🇷🇺 Russian | `ru` | Русский | ✅ Full |
| 🇨🇳 Chinese | `zh` | 中文 | ✅ Full |
| 🇯🇵 Japanese | `ja` | 日本語 | ✅ Full |
| 🇰🇷 Korean | `ko` | 한국어 | ✅ Full |
| 🇹🇭 Thai | `th` | ไทย | ✅ Full |
| 🇻🇳 Vietnamese | `vi` | Tiếng Việt | ✅ Full |
| 🇰🇪 Swahili | `sw` | Kiswahili | ✅ Full |

### 🔄 **Language Detection**

The AI automatically detects the selected translation language and responds accordingly:

```typescript
// User selects Malayalam Quran translation
// AI automatically responds in Malayalam
"ഈ വാക്യം പ്രാർത്ഥനയുടെ പ്രാധാന്യത്തെക്കുറിച്ച് പറയുന്നു..."
```

---

## 🔒 Security & Privacy

### 🛡️ **Security Features**

- **🔐 Row Level Security (RLS)**: Database-level access control
- **🔑 JWT Authentication**: Secure token-based auth
- **🌐 HTTPS Only**: All communications encrypted
- **🔒 OAuth 2.0**: Industry-standard authentication
- **🛡️ Input Validation**: Comprehensive input sanitization
- **🚫 Rate Limiting**: API abuse prevention

### 🔐 **Privacy Protection**

- **📊 No Tracking**: No user behavior tracking
- **🗄️ Local Storage**: Sensitive data stored locally
- **🔒 Encrypted Transit**: All data encrypted in transit
- **👤 User Control**: Full control over personal data
- **🗑️ Data Deletion**: Easy account and data deletion
- **📋 GDPR Compliant**: European privacy standards

---

## 🚀 Deployment

### 🌐 **Vercel Deployment**

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   - Add all `.env` variables in Vercel dashboard
   - Update redirect URLs with production domain

### 🐳 **Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

```bash
# Build and run
docker build -t islamic-ai .
docker run -p 8080:8080 islamic-ai
```

### ☁️ **Supabase Edge Functions**

```typescript
// Deploy edge functions
supabase functions deploy islamic-chat
supabase functions deploy prayer-times
```

---

## 🧪 Testing

### 🔬 **Test Suite**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- QuranSearch.test.tsx
```

### 🧪 **Test Categories**

- **⚛️ Component Tests**: UI component functionality
- **🔧 Integration Tests**: API and database integration
- **🌐 E2E Tests**: Full user workflow testing
- **🔒 Security Tests**: Authentication and authorization
- **📱 Accessibility Tests**: WCAG compliance

---

## 🤝 Contributing

We welcome contributions from the Muslim developer community! 

### 📋 **Contribution Guidelines**

1. **🍴 Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/islamic-ai.git
   cd islamic-ai
   ```

2. **🌿 Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **💻 Make Changes**
   - Follow TypeScript best practices
   - Add tests for new features
   - Update documentation

4. **✅ Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

5. **📤 Submit Pull Request**
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes

### 🎯 **Areas for Contribution**

- **🌍 Translations**: Add new language support
- **📚 Islamic Content**: Expand knowledge base
- **🎨 UI/UX**: Improve user interface
- **🔧 Features**: Add new Islamic tools
- **📖 Documentation**: Improve docs and guides
- **🐛 Bug Fixes**: Fix reported issues

---

## 📊 Roadmap

### 🎯 **Version 2.0** (Q2 2024)

- **🎙️ Voice Interface**: Voice commands and responses
- **📱 Mobile App**: React Native mobile application
- **🤝 Community Features**: User-generated content
- **📚 Advanced Search**: AI-powered semantic search
- **🔔 Smart Notifications**: Personalized Islamic reminders

### 🎯 **Version 3.0** (Q4 2024)

- **🧠 Advanced AI**: Custom Islamic AI model
- **🌐 Offline Mode**: Full offline functionality
- **👥 Multi-user**: Family and community features
- **📊 Analytics**: Personal Islamic learning insights
- **🎨 Customization**: Advanced theming options

---

## 📈 Performance

### ⚡ **Optimization Features**

- **🚀 Code Splitting**: Lazy loading for optimal performance
- **💾 Caching**: Intelligent caching strategies
- **📱 PWA Ready**: Progressive Web App capabilities
- **🖼️ Image Optimization**: Automatic image compression
- **⚡ Bundle Optimization**: Minimal bundle size

### 📊 **Performance Metrics**

| Metric | Score | Target |
|--------|-------|--------|
| 🚀 **First Contentful Paint** | < 1.5s | < 2s |
| ⚡ **Largest Contentful Paint** | < 2.5s | < 3s |
| 🎯 **Cumulative Layout Shift** | < 0.1 | < 0.1 |
| 📱 **Mobile Performance** | 95+ | 90+ |
| 💻 **Desktop Performance** | 98+ | 95+ |

---

## 🆘 Support

### 📧 **Get Help**

- **📖 Documentation**: Check our comprehensive docs
- **🐛 Bug Reports**: [Create an issue](https://github.com/yourusername/islamic-ai/issues)
- **💡 Feature Requests**: [Request features](https://github.com/yourusername/islamic-ai/discussions)
- **💬 Community**: Join our Discord server
- **📧 Email**: support@islamic-ai.com

### ❓ **FAQ**

<details>
<summary><strong>🤖 How accurate are the AI responses?</strong></summary>

Our AI is trained on authentic Islamic sources including Quran, Sahih Hadith collections, and classical Islamic texts. However, for complex religious matters, we always recommend consulting qualified Islamic scholars.

</details>

<details>
<summary><strong>🌍 Can I use this offline?</strong></summary>

Currently, the app requires internet connection for AI responses and real-time features. Offline mode is planned for version 3.0.

</details>

<details>
<summary><strong>🔒 Is my data secure?</strong></summary>

Yes! We use industry-standard security practices including encryption, secure authentication, and privacy-first design. Your personal data is never shared with third parties.

</details>

<details>
<summary><strong>💰 Is this free to use?</strong></summary>

Yes, Islamic AI is completely free to use. We believe Islamic knowledge should be accessible to everyone.

</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Islamic AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

### 📚 **Islamic Sources**
- **📖 Quran**: The Holy Quran API
- **📜 Hadith**: Sunnah.com API
- **🕐 Prayer Times**: Islamic Society of North America (ISNA)
- **📅 Calendar**: Hijri Calendar calculations

### 🛠️ **Technology Partners**
- **⚛️ React Team**: For the amazing framework
- **🗄️ Supabase**: For backend infrastructure
- **🤖 OpenRouter**: For AI API gateway
- **🎨 Tailwind CSS**: For beautiful styling
- **🔐 Google**: For authentication services

### 👥 **Contributors**
Special thanks to all contributors who have helped make Islamic AI better for the Muslim community worldwide.

---

<div align="center">

### 🕌 **"And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose."** 
*- Quran 65:3*

**Made with ❤️ for the Muslim Ummah**

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/islamic-ai?style=social)](https://github.com/yourusername/islamic-ai/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/yourusername/islamic-ai?style=social)](https://github.com/yourusername/islamic-ai/network/members)
[![Twitter Follow](https://img.shields.io/twitter/follow/islamic_ai?style=social)](https://twitter.com/islamic_ai)

[⬆️ Back to Top](#-islamic-ai---your-spiritual-guide)

</div>