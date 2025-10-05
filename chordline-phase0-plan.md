# ChordLine — Phase 0 Completion Plan

This document describes the complete set of updates, integrations, and refactors required to complete **Phase 0** of the ChordLine app.

---

## Overview

**Objective:** Finalize all core functionality to deliver a usable MVP for musicians to manage shows, earnings, weather, and integrations (Spotify, Google Calendar, Mapbox, OpenWeatherMap).

**Scope:**
- Replace home dashboard with a functional **calendar view**
- Complete **Google Calendar**, **Spotify for Artists**, **Setlists**, and **Venue Autocomplete** integrations
- Remove unnecessary tabs (Integrations/Apps)
- Add **social caption generation**, **weather display**, and **export tools**
- Prepare data models, Supabase schema, and UX polish for launch

---

## Phase 0 Breakdown by Pull Request (PR)

### PR1 — Calendar Dashboard

**Goal:** Replace home page with a calendar showing shows, earnings, and weather.

**Files to Edit**
- `src/pages/Dashboard.tsx`
- `src/App.tsx`
- `src/lib/useShows.ts`
- `src/lib/useEarnings.ts`
- `src/services/weather.ts`

**New Files**
- `src/components/calendar/MonthCalendar.tsx`

**Features**
- Month view grid with:
  - Shows displayed as dots or chips
  - Daily earnings totals
  - Upcoming weather (OpenWeatherMap API)
- Click on a date opens a small drawer showing:
  - Show details (title, venue, setlist link)
  - Total earnings
  - Forecast summary

**Acceptance Criteria**
- Calendar is visible on home page
- Weather only appears for upcoming shows (next 7 days)
- Works with mock and real data

---

### PR2 — Google Calendar Integration

**Goal:** Enable Google Calendar connection and embed view.

**Files to Edit**
- `src/pages/Profile.tsx` (add “Connections” section)
- `src/pages/CalendarEmbed.tsx` (new)
- `src/App.tsx` (add `/calendar` route)
- Supabase function or `supabase.ts` for OAuth token storage

**Database**
```sql
CREATE TABLE oauth_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  provider text check (provider = 'google'),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text
);
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tokens" ON oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);
```

**Acceptance Criteria**
- “Connect Google Calendar” button appears in Profile
- `/calendar` route shows an embedded calendar if connected
- Calendar events can optionally overlay in Dashboard

---

### PR3 — Spotify for Artists Integration + Setlists

**Goal:** Make Spotify “available” and add setlist creation linked to shows.

**Files to Edit**
- `src/pages/Profile.tsx` (add Spotify artist name field)
- `src/pages/Dashboard.tsx` (show Spotify stats card)
- `src/pages/Shows.tsx` (add setlist section)
- `src/lib/spotify.ts` (new service file)

**Database**
```sql
ALTER TABLE orgs ADD COLUMN spotify_artist_name text;

CREATE TABLE setlists (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id),
  name text,
  notes text,
  created_at timestamptz default now()
);

CREATE TABLE setlist_songs (
  id uuid primary key default uuid_generate_v4(),
  setlist_id uuid references setlists(id) on delete cascade,
  title text,
  artist text,
  duration_sec int,
  spotify_track_id text,
  position int
);

CREATE TABLE show_setlists (
  show_id uuid references shows(id) on delete cascade,
  setlist_id uuid references setlists(id) on delete cascade,
  primary boolean default false,
  primary key (show_id, setlist_id)
);
```

**Features**
- Fetch artist stats (followers, popularity, top tracks)
- CRUD for setlists with reorder and track search via Spotify API
- Assign setlist to a show

**Acceptance Criteria**
- Spotify is “available” and shows data for entered artist name
- Setlists can be created, edited, and assigned

---

### PR4 — Remove Apps Page & Fold Integrations

**Goal:** Remove separate Integrations tab and embed functionality where needed.

**Files to Remove**
- `src/pages/Integrations.tsx`
- `src/routes/integrations` from `src/App.tsx`

**Other File Updates**
- `src/pages/Shows.tsx` — venue field with Mapbox autocomplete + Google Places details
- `src/pages/Profile.tsx` — connections and exports
- `src/pages/Dashboard.tsx` — calendar as main surface

**Acceptance Criteria**
- No Integrations tab in the app
- Venue field autocompletes correctly
- Google and Spotify connections live under Profile

---

### PR5 — Social Caption Generator

**Goal:** Replace Instagram integration with auto-generated social captions.

**Files to Edit**
- `src/pages/Shows.tsx` (add “Generate Caption” button)
- `src/lib/utils.ts` (add caption template builder)

**Template Example**
```
🎶 {band} is playing at {venue} on {date}! 
{weather_summary}
Come join us for a great night! 🎸
```

**Acceptance Criteria**
- Generates text and copies to clipboard
- No Instagram integration required

---

### PR6 — Weather Enhancements

**Goal:** Display weather on all relevant views.

**Files to Edit**
- `src/services/weather.ts`
- `src/components/calendar/MonthCalendar.tsx`

**Features**
- Weather icons + tooltips for upcoming shows
- Drawer view per show with weather summary

**Acceptance Criteria**
- Weather icons appear on future show dates
- Past shows don’t fetch weather

---

### PR7 — Export Tools in Profile

**Goal:** Centralize all export features in Profile page.

**Files to Edit**
- `src/pages/Profile.tsx` (add “Exports” section)
- `src/lib/exports.ts` (new)

**Exports**
- Shows (CSV)
- Earnings (CSV)
- Setlists (CSV)
- ICS feed (read-only URL)

**Acceptance Criteria**
- Exports accessible from Profile
- Data matches user’s org and date range

---

## Database Summary

| Table | Purpose |
|-------|----------|
| `oauth_tokens` | Store Google OAuth credentials |
| `setlists` | Store named setlists |
| `setlist_songs` | Store songs in each setlist |
| `show_setlists` | Link shows to setlists |
| `orgs` | Add `spotify_artist_name` column |

All tables use RLS with `org_id in user_orgs` or `user_id = auth.uid()`.

---

## Environment Variables

| Variable | Description |
|-----------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_OPENWEATHERMAP_API_KEY` | OpenWeatherMap key |
| `VITE_MAPBOX_API_KEY` | Mapbox key |
| `VITE_GOOGLE_API_KEY` | Google Maps/Places API key |
| `VITE_OPENROUTER_API_KEY` | For AI assistant features |

---

## Acceptance Checklist

- [ ] Dashboard calendar shows shows, earnings, and weather
- [ ] Google Calendar connect + embed functional
- [ ] Spotify integration available (followers, top tracks, popularity)
- [ ] Setlists fully CRUD and linkable to shows
- [ ] Integrations tab removed
- [ ] Venue autocomplete (Mapbox + Places)
- [ ] “Generate Caption” button on shows
- [ ] Weather visible for future shows
- [ ] Exports accessible via Profile page

---

**Completion of these updates marks Phase 0 as feature-complete and ready for testing via browser MCP tools and user feedback.**
