# 🧪 Local Testing with Full Mocks — General Guide

## 1. Objectives
You want to:
- Run the full app locally without hitting live APIs.
- Test everything (shows, earnings, weather, Spotify, Google Calendar, etc.) using **mock data**.
- Ensure local behavior is close to production, including UI flows.

---

## 2. Two Recommended Local Testing Modes

### **Mode A — Lightweight Mock Mode**
**Goal:** Run the frontend only, with everything mocked.

**Approach:**
- Use **MSW (Mock Service Worker)** or similar to intercept all API calls in the browser.
- Store fake data in JSON fixtures (`src/mocks/fixtures`).
- Replace:
  - Supabase calls → mock responses.
  - AI calls (OpenRouter) → fixed responses.
  - External APIs (Weather, Mapbox, Google, Spotify) → stubbed responses.
- Add an environment flag like `VITE_MOCK_MODE=1` to switch between live and mock.

**Pros:**  
Super fast, no backend required.

**Cons:**  
Not useful for DB schema or auth testing.

---

### **Mode B — Full Local Stack**
**Goal:** Run a near-production environment locally.

**Approach:**
- Use **Docker Compose** or **Supabase CLI** to start:
  - Local Postgres (Supabase)
  - WireMock containers for external APIs
- Seed the database with test data.
- Run your frontend against these local services.

**Pros:**  
High realism — full backend + auth + data rules.  
**Cons:**  
More setup time, slightly slower.

---

## 3. What to Mock
| Integration | How to Mock | Notes |
|--------------|--------------|-------|
| **Supabase (DB)** | Supabase local Docker or MSW stub | For local DB logic or fixtures |
| **Google Calendar** | WireMock stub / iFrame with fake calendar | Use local URL for testing |
| **Spotify API** | JSON mock or WireMock | Return fake artist + track data |
| **OpenWeatherMap** | JSON mock or WireMock | Return deterministic weather data |
| **Mapbox / Google Places** | JSON mock | Return fake venues |
| **OpenRouter (AI)** | Static text | Return fixed AI responses like captions |

---

## 4. Local Run Workflow

### 🧩 Step 1 — Add a “Mock Mode”
Use a flag (`VITE_MOCK_MODE=true`) in `.env.local`  
Conditionally load:
- Mock Supabase client  
- Mock API routes  
- Mock data files  

### 🐳 Step 2 — Start Local Containers (optional)
If using Docker:
```bash
docker compose -f docker-compose.mock.yml up
```
This can run local services like Supabase and WireMock.

### 🧰 Step 3 — Seed Data
For realism, add seed data for:
- Shows
- Earnings
- Setlists
- Weather forecasts

### 🧪 Step 4 — Run in Mock Mode
```bash
npm run dev:mock
```
or simply start your local app with the `VITE_MOCK_MODE` flag.

### 🧼 Step 5 — Switch Between Modes
Toggle `.env.local`:
- `VITE_MOCK_MODE=1` → full mock  
- `VITE_MOCK_MODE=0` → connect to real Supabase + APIs

---

## 5. Recommended Folder Structure
```
/src/mocks/
  ├── fixtures/
  │   ├── shows.json
  │   ├── earnings.json
  │   └── setlists.json
  ├── browser.ts
  ├── handlers.ts
/mocks/
  ├── openweather/
  ├── spotify/
  ├── googleplaces/
  └── openrouter/
```

---

## 6. Testing Tips
- Keep fixtures **small and deterministic** (consistent test results).  
- Add snapshot or visual regression tests with mock data.  
- Ensure mock responses mirror real schema shape.  
- Document any differences between mock vs. prod mode.

---

## ✅ Outcome
By following this setup:
- You can fully test your UI and workflows offline.
- Switching to real integrations for staging is just an `.env` change.
- Developers and testers share consistent mock data and conditions.
