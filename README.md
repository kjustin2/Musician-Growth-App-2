# ChordLine - Musician Growth Platform 🎵

<div align="center">
  <img src="public/icon-192x192.png" alt="ChordLine Logo" width="128" height="128">
  <p><em>Your complete band management platform</em></p>
</div>

---

A modern, **mobile-first** web application for musicians and bands to manage shows, track earnings, and grow their careers with AI-powered insights.

## ✨ Features

### 🎤 **Complete Band Management**
- **Show Management**: Schedule, track, and manage all your performances
- **Earnings Tracking**: Monitor revenue from shows, streaming, merchandise, and lessons
- **Organization Management**: Handle multiple bands with role-based permissions
- **AI Assistant**: Get intelligent suggestions and automate routine tasks
- **External Integrations**: Connect with Google Calendar, Spotify, weather services, and more

### 📱 **Modern User Experience**
- **Mobile-First Design**: Optimized for musicians on-the-go
- **Progressive Web App**: Install directly on your phone like a native app
- **Responsive Interface**: Works perfectly on all devices
- **Dark/Light Themes**: Automatic theme switching based on system preferences
- **Offline Capabilities**: Core features work without internet

### 🔒 **Enterprise-Grade Security**
- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Magic link email + Google OAuth
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Role-Based Access**: Owner, admin, and member permissions

## 🚀 Quick Start

### **Option 1: Local Development with Mock Data (Recommended for testing)**

```bash
# Clone and setup
git clone <repository-url>
cd musician-growth-app-2
npm install

# Start with mock data (no Supabase needed)
npm run dev

# Open http://localhost:5173
# Sign in with any email to see mock data
```

### **Option 2: Full Production Setup**

1. **Prerequisites**
   - Node.js 18+
   - Supabase account
   - Google OAuth app (optional)

2. **Setup Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Database Setup**
   ```bash
   # Run the database migrations (see database/README.md)
   npm run supabase:start  # For local development
   # OR setup production Supabase instance
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **React Router 7** - Client-side routing
- **React Query** - Server state management

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level access control
- **Real-time subscriptions** - Live data updates

### **Testing & Quality**
- **Browser MCP** - Interactive testing via Warp's browser tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Prettier** - Code formatting

### **Deployment & PWA**
- **Vite PWA Plugin** - Service worker and offline support
- **GitHub Pages** - Static site hosting
- **Vercel/Netlify** - Production deployment options

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Quality & Testing
npm run lint         # ESLint checking
npm run type-check   # TypeScript validation
# Interactive testing via Warp's browser MCP tools

# Database (with Supabase CLI)
npm run supabase:start    # Start local Supabase
npm run supabase:stop     # Stop local Supabase
npm run supabase:reset    # Reset database
npm run generate-types    # Generate TypeScript types
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthGuard.tsx   # Route protection
│   ├── Layout.tsx      # App layout with navigation
│   └── CreateOrgModal.tsx
├── contexts/           # React contexts for global state
│   ├── AuthContext.tsx # Authentication state
│   └── OrgContext.tsx  # Organization management
├── pages/             # Route components
│   ├── Dashboard.tsx  # Main dashboard
│   ├── Shows.tsx      # Show management
│   ├── Earnings.tsx   # Financial tracking
│   ├── Assistant.tsx  # AI chat interface
│   ├── Integrations.tsx # External services
│   └── Profile.tsx    # User profile
├── services/          # API and external services
│   └── supabase.ts    # Supabase client
├── types/            # TypeScript type definitions
│   ├── index.ts      # Domain types
│   └── supabase.ts   # Generated database types
├── lib/              # Utility functions
│   └── utils.ts      # Common utilities
└── App.tsx           # Main app component
```

## 🌍 Environment Variables

### **Required for Production**
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Optional Integrations**
```bash
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### **Development Settings**
```bash
VITE_NODE_ENV=development
VITE_USE_MOCK_DATA=true    # Enable mock mode
VITE_AI_PROVIDER=mock      # Use mock AI responses
```

## 📱 Progressive Web App

ChordLine is a full PWA that can be installed on mobile devices:

1. **Mobile Installation**
   - Visit the app in Chrome/Safari
   - Tap "Add to Home Screen"
   - Use like a native app

2. **Desktop Installation**
   - Visit in Chrome/Edge
   - Click install icon in address bar
   - Launches like a desktop app

## 🎯 Key Features Deep Dive

### **Show Management**
- Create and schedule performances
- Track venue information and capacity
- Monitor ticket sales and attendance
- Manage show status (planned → confirmed → completed)
- Weather integration for outdoor shows
- Calendar synchronization

### **Earnings Tracking** 
- Multiple revenue streams (shows, streaming, merchandise, lessons)
- Automatic calculations and summaries
- Time-based filtering (weekly, monthly, yearly)
- Tax-ready export formats
- Integration with show data

### **AI Assistant**
- Natural language processing for band management
- Automated data entry suggestions
- Performance insights and recommendations
- Smart scheduling assistance
- Contextual help and guidance

### **Organization Management**
- Multi-band support for busy musicians
- Role-based permissions (owner, admin, member)
- Member invitation system
- Data isolation per organization
- Team collaboration features

## 🔐 Security & Privacy

- **Authentication**: Magic link email + OAuth providers
- **Authorization**: Row Level Security policies
- **Data Protection**: End-to-end encryption
- **Privacy**: No tracking, minimal data collection
- **Compliance**: GDPR-ready architecture

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch
3. **Test** features using browser MCP tools
4. **Ensure** code quality passes
5. **Submit** a pull request

### **Development Guidelines**
- Follow TypeScript best practices
- Test features interactively with browser MCP tools
- Maintain mobile-first design principles
- Use semantic commit messages
- Update documentation for new features

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p><strong>Built with ❤️ for the music community</strong></p>
  <p><em>Help musicians manage their careers and grow their success</em></p>
</div>
