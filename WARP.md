# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**ChordLine** is a mobile-first Progressive Web App (PWA) for bands to plan shows, track earnings, and get AI-powered assistance. This is Phase 0 implementation focusing on core functionality for small bands (≤ 5 users).

### Core Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Database/Auth**: Supabase (Postgres + Edge Functions + Auth)
- **AI**: OpenRouter/OpenAI for assistant functionality
- **Maps**: Mapbox JS SDK for venue locations
- **Weather**: OpenWeatherMap API
- **Deployment**: GitHub Pages (static) + Supabase backend

### Key Features (Phase 0)
1. **Show Management**: Log and view performances with venue, date, earnings
2. **AI Assistant**: Natural language interface for creating shows and actions  
3. **Mobile-First PWA**: Installable app experience with offline support
4. **Multi-Band Support**: Team-based authentication and permissions
5. **Integrations**: Weather, maps, calendar sync, social sharing

## Development Commands

### Getting Started
```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Workflow
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Start local Supabase (requires Docker)
npm run supabase:start

# Check Supabase status
npm run supabase:status

# Reset local database
npm run supabase:reset

# Generate TypeScript types from Supabase schema
npm run generate-types
```

### Testing the App
```bash
# Start dev server and visit http://localhost:5173
npm run dev

# Test PWA installation in Chrome/Edge:
# 1. Open DevTools > Application > Manifest
# 2. Click "Install" or use browser's install prompt
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── Layout.tsx      # Main app layout with bottom navigation
├── pages/              # Route-level page components
│   ├── Dashboard.tsx   # Home page with quick actions
│   ├── Shows.tsx       # Show management
│   ├── Earnings.tsx    # Financial tracking
│   ├── Assistant.tsx   # AI chat interface
│   └── Profile.tsx     # User/band settings
├── hooks/              # Custom React hooks
├── services/           # API clients and external services
│   └── supabase.ts     # Supabase configuration and auth helpers
├── stores/             # Global state management
├── types/              # TypeScript type definitions
│   ├── index.ts        # Core domain types (Show, Band, Venue, etc.)
│   └── supabase.ts     # Auto-generated database types
├── lib/
│   └── utils.ts        # Utility functions (cn for className merging)
└── assets/             # Static assets and icons
```

## Database Schema (Core Tables)

The app uses Supabase with the following main entities:

- **profiles**: User accounts and authentication
- **bands**: Band/organization records
- **band_members**: User-to-band relationships with roles
- **venues**: Performance locations with geocoding
- **shows**: Performance records with status, date, notes
- **earnings**: Financial data linked to shows
- **assistant_plans**: AI-generated action proposals

## Mobile-First Design Principles

- **Bottom Navigation**: Fixed tab bar for primary navigation
- **Card-Based Layout**: All content uses card components for mobile readability  
- **Touch-Friendly**: 44px minimum touch targets, appropriate spacing
- **Responsive Typography**: Tailwind's responsive text classes
- **Progressive Enhancement**: Works without JavaScript, enhanced with React

## AI Assistant Integration

The assistant accepts natural language input like:
> "We played at The Bluebird tonight for $600"

And generates structured action plans:
- Create Show (venue, date)
- Add Earnings ($600)
- User confirms with Yes/No before applying

This prevents unwanted auto-modifications while providing intelligent suggestions.

## API Integration Guidelines

### Development vs Production
- Use `.env` file for API keys
- Set `VITE_USE_LIVE_APIS=false` for development with mocked responses
- Set `VITE_AI_PROVIDER=mock` to avoid AI costs during development

### External APIs Used
- **Supabase**: Authentication, database, real-time subscriptions
- **OpenRouter/OpenAI**: AI assistant responses
- **Mapbox**: Venue geocoding and map displays  
- **OpenWeatherMap**: Weather forecasts for shows
- **Google Calendar**: Import/export show dates

## Common Development Tasks

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx` 
3. Add navigation tab in `src/components/Layout.tsx` if needed

### Adding shadcn/ui Components
```bash
# Example: adding a Button component
npx shadcn@latest add button
```

### Database Changes
1. Modify schema in Supabase dashboard or migrations
2. Run `npm run generate-types` to update TypeScript definitions
3. Update `src/types/index.ts` if domain types changed

### Environment Setup for New Developers
1. Clone repository
2. Copy `.env.example` to `.env`
3. Create Supabase project at supabase.com
4. Add Supabase URL and anon key to `.env`
5. Optionally add other API keys for full functionality
6. Run `npm install && npm run dev`

## Deployment

### GitHub Pages Deployment
The project is configured for static deployment to GitHub Pages:
1. `npm run build` creates static files in `dist/`
2. GitHub Actions deploys to `gh-pages` branch
3. Supabase handles backend/database separately

### PWA Requirements
- Manifest file auto-generated by Vite PWA plugin
- Service worker handles offline caching
- HTTPS required for PWA installation (GitHub Pages provides this)

## Cost Management

Target monthly costs for ≤5 users:
- GitHub Pages: $0
- Supabase: $0-25 (likely free tier)
- OpenRouter AI: $0-1 (use free models)
- Mapbox: $0 (free tier)
- Other APIs: $0 (free tiers)

**Total: ~$5/month maximum**

## Future Upgrade Path (Post-Phase 0)
- Offline-first architecture with sync
- Native mobile apps (Expo)
- Stripe billing for Pro features
- Advanced AI venue suggestions
- Band finance split tracking