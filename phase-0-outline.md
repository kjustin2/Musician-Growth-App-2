# 🎸 ChordLine — Phase 0 Product Spec

**Goal:**  
A mobile-friendly web app for bands to plan shows, track earnings, and get smart suggestions through an AI assistant.  

**Focus:**  
Fast MVP → usable by small bands (≤ 5 users), cheap to host, installable as a PWA, and easy to upgrade later.

---

## 🚀 Core Objectives
1. Let bands **log and view shows** (venue, date, time, earnings).  
2. Provide an **AI assistant** that turns chat input into structured actions.  
3. Offer a **mobile-first**, installable experience (no App Store yet).  
4. Enable **sign-in** and multi-member bands.  
5. Deliver **useful free integrations** that musicians instantly recognize.  

---

## 🧭 User Experience Flow

### 1. Sign In / Sign Up
- Sign in with **email (magic link)** or **Google OAuth** via Supabase Auth.  
- First login prompts:  
  - “Create a Band” → choose band name.  
  - Invite members by email.  
- Redirect to the **Dashboard** after setup.  

---

### 2. Dashboard (Home)
- Compact, mobile-first card layout.  
- Top area:  
  - “Next Show” card (venue, date, countdown).  
  - Weather snippet (from OpenWeatherMap).  
- Below:  
  - Upcoming Shows list.  
  - Quick Actions:  
    - ➕ Log a Show  
    - 💬 Ask ChordLine AI  
    - 📆 Import from Calendar  
- Footer tab bar (nav):  
  - 🏠 Dashboard 🗓️ Shows 💰 Earnings 🎤 Assistant ⚙️ Profile  

---

### 3. Add / View Show

#### Create Show Form
- Venue Search → Mapbox Autocomplete (free) + Google Places Details lookup.  
- Date + Time picker.  
- Optional fields: setlist name, notes, weather auto-filled.  
- “Add Earnings” toggle → simple gross amount field.  
- Button → “Save Show”.  

#### Show Detail View
- Header: Venue name, date, time.  
- Map pin (Mapbox embed).  
- Weather forecast icon + temperature.  
- Gross earnings display.  
- “Share to Socials” → copies Instagram-ready caption.  
- “Add to Google Calendar” button.  
- “Export .ics Feed” option.  

---

### 4. Earnings Overview
- List of shows with earnings per date.  
- Totals per month / per year.  
- Export → CSV or Google Sheet.  

---

### 5. AI Assistant 🎤

#### Purpose
Let users type or talk to ChordLine AI:  
> “We played at The Bluebird tonight for $600”  
→ Assistant suggests plan:  
> • Create Show (Bluebird / Oct 4)  • Add Earnings ($600)  

User sees quick confirmation: **Apply plan? [Yes] [No]**

#### Features
- Quick Yes/No confirmations (no auto writes).  
- Context-aware suggestions (e.g., add weather, create calendar event).  
- Uses OpenRouter free models by default (cost ≈ $0).  
- Stores history of assistant plans for audit trail.  

---

### 6. Integrations

| Category | Integration | Function | Cost |
|-----------|--------------|-----------|------|
| Scheduling | **Google Calendar** | Import / Add shows | Free |
| Music Data | **Spotify API** | Song metadata for setlists | Free |
| Maps | **Mapbox** | Venue pins + tour map | Free tier |
| Weather | **OpenWeatherMap** | Forecast on show cards | Free tier |
| Social | **Instagram Share Caption** | Copy-paste gig post | Free |
| Calendar Sync | **ICS Feed** | Read-only feed for fans | Free |

---

### 7. Share Caption Template

```
🎶 [Band Name] Live! 🎶

📍 [Venue Name], [City]  
📅 [Day of Week], [Month Day, Year]  
⏰ [On-Stage Time]  
🌤️ Forecast: [Weather Summary], [Temp]°F  

Tickets/Info: [Gig Link]

#LiveMusic #GigLife #[BandName] #[City] #[Genre]
```

- Tap “Share to Socials” → auto-copies text.  
- Future: allow custom band-default hashtags.  

---

## ⚙️ Tech Stack Overview

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React + Vite + Tailwind + shadcn/ui | Fast mobile-first UI |
| State/Data | TanStack Query + Supabase JS | Data fetch & mutations |
| Auth | Supabase Auth (Email + Google) | Sign-in / multi-band |
| Backend | Supabase (Postgres + Edge Functions) | API + RLS security |
| AI | OpenRouter (default) or OpenAI mini | Assistant plans |
| Hosting | GitHub Pages (static frontend) + Supabase backend | $0 / low-cost |
| Maps | Mapbox JS SDK | Venue pins, tour map |
| Weather | OpenWeatherMap API | Forecasts |
| Calendar | Google Calendar API + ICS feeds | Sync + export |

---

## 💰 Estimated Monthly Costs (@ ≤ 5 users)

| Service | Est. Monthly Cost | Notes |
|----------|------------------|-------|
| GitHub Pages | $0 | static hosting |
| Supabase | $0 – $25 | Free plan likely enough |
| OpenRouter / LLM | $0 – $1 | use free tier models for testing |
| Mapbox | $0 | within free tile limits |
| OpenWeatherMap | $0 | free tier 1M calls/mo |
| Google Calendar | $0 | free API quota |
| **Total ≈** | **$0 – $5/mo** | very low burn for MVP |

---

## 🧱 Data Model Highlights
- `profiles` — user profiles  
- `orgs` / `org_members` — bands and roles  
- `venues` — cached Mapbox/Google place data  
- `shows` — date, venue, status, notes  
- `earnings` — gross amount, currency  
- `assistant_plans` — AI proposals + status  

---

## 🧩 Future-Ready Upgrade Path
- **Offline mode + PWA sync** (Phase 1)  
- **Stripe billing** for Pro features  
- **Native mobile apps** (Expo)  
- **AI venue suggestions** / tour routing  
- **Band finance split tracking**  

---

## 🧪 Local Testing Setup
1. Run Supabase CLI locally.  
2. Mock AI calls (`AI_PROVIDER=mock`).  
3. Stub Mapbox and Weather with JSON fixtures.  
4. Flip real APIs on with `USE_LIVE_APIS=true`.  
5. Watch cost logs and auto-disable paid calls if >$5 budget.  

---

### ✅ Phase-0 Goal
Deliver a live installable PWA where a band can:  
1. Sign in / create band.  
2. Add a show and see it on a map.  
3. View weather + earnings.  
4. Share to socials and export calendar feed.  
5. Chat with the AI assistant to auto-log shows.  

---
