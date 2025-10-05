# 🧪 Mode B Local Testing Guide

## Overview

This guide covers the **Mode B** local testing setup for the Musician Growth App. Mode B provides a full local stack including:

- **Local Supabase instance** (database, auth, storage, realtime)
- **Mock external API servers** (OpenWeather, Spotify, Google Calendar, OpenRouter, Mapbox)
- **Realistic test data** with sample bands, shows, venues, and user accounts
- **Service health monitoring** and debugging tools

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Mode B Local Stack                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────────────────────────────┐ │
│  │   React App     │    │           Mock APIs                     │ │
│  │  (port 5173)    │    │                                         │ │
│  │                 │    │  • OpenWeather  (8081)                 │ │
│  │  [Service       │◄──►│  • Spotify      (8082)                 │ │
│  │   Abstraction   │    │  • Google Cal   (8083)                 │ │
│  │   Layer]        │    │  • OpenRouter   (8084)                 │ │
│  │                 │    │  • Mapbox       (8085)                 │ │
│  │                 │    │  • Combined     (8080)                 │ │
│  └─────────────────┘    └─────────────────────────────────────────┘ │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                 Supabase Local                                  │ │
│  │                                                                 │ │
│  │  • Database     (54322)                                        │ │
│  │  • API Gateway  (54321)                                        │ │
│  │  • Auth         (54321)                                        │ │
│  │  • Storage      (54321)                                        │ │
│  │  • Realtime     (54321)                                        │ │
│  │  • Studio       (54323)                                        │ │
│  │  • Email Test   (54324)                                        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔧 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
2. **npm** (comes with Node.js)
3. **PowerShell** (pre-installed on Windows)

### Optional but Recommended

- **Docker Desktop** (for future Docker-based setup)
- **Postman** or similar API testing tool
- **VS Code** with extensions:
  - Thunder Client (API testing)
  - REST Client
  - Supabase extension

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Clone and navigate to project
cd Musician-Growth-App-2

# Install dependencies
npm install

# Initialize Supabase (already done)
npx supabase init
```

### 2. Start the Local Stack

**Option A: Using PowerShell Script (Recommended)**
```powershell
# Start everything
PowerShell -ExecutionPolicy Bypass -File scripts/local-stack.ps1 start

# Check status
PowerShell -ExecutionPolicy Bypass -File scripts/local-stack.ps1 status
```

**Option B: Manual Steps**
```bash
# Start Supabase
npm run supabase:start

# Start mock APIs (in separate terminal)
npm run mocks:start

# Start the app (in another terminal)
npm run dev:mock
```

### 3. Verify Setup

1. **Supabase Studio**: [http://localhost:54323](http://localhost:54323)
2. **Mock APIs Health**: [http://localhost:8080/health](http://localhost:8080/health)
3. **App**: [http://localhost:5173](http://localhost:5173)
4. **Health Dashboard**: [http://localhost:5173/dev/health](http://localhost:5173/dev/health)

## 📍 API Endpoint Mapping

| Service | Local URL | Production URL | Port |
|---------|-----------|----------------|------|
| **Supabase** | `http://127.0.0.1:54321` | `https://your-project.supabase.co` | 54321 |
| **OpenWeather** | `http://localhost:8081` | `https://api.openweathermap.org` | 8081 |
| **Spotify** | `http://localhost:8082` | `https://api.spotify.com` | 8082 |
| **Google Calendar** | `http://localhost:8083` | `https://www.googleapis.com` | 8083 |
| **OpenRouter** | `http://localhost:8084` | `https://openrouter.ai` | 8084 |
| **Mapbox** | `http://localhost:8085` | `https://api.mapbox.com` | 8085 |

## 🧾 Mock Data Structure

### Test Users

| Email | Password | Role | Band |
|-------|----------|------|------|
| `demo@chordline.app` | `password123` | Owner | The Midnight Echoes |
| `sarah.songwriter@music.com` | `password123` | Owner | Electric Sunrise |
| `mike.bassist@band.com` | `password123` | Member | The Midnight Echoes |

### Test Bands

- **The Midnight Echoes** - Indie folk rock band
- **Electric Sunrise** - Electronic pop duo
- **The Wandering Minstrels** - Acoustic folk trio
- **Neon Nights** - Synthwave band

### Test Venues

- **The Bluebird Cafe** (Nashville, TN) - Capacity: 90
- **Mercury Lounge** (New York, NY) - Capacity: 250
- **The Troubadour** (West Hollywood, CA) - Capacity: 500
- **Red Rocks Amphitheatre** (Morrison, CO) - Capacity: 9,525

### Mock API Responses

**OpenWeather Examples:**
- Nashville: Clear skies, 72°F
- New York: Cloudy, 66°F
- San Francisco: Misty, 58°F
- Austin: Light rain, 78°F

**Spotify Mock Data:**
- Artist profiles with follower counts
- Track metadata and popularity scores
- Playlist information
- Search functionality

## 🧪 Common Testing Scenarios

### 1. User Authentication Flow
```bash
# Test user login
POST http://localhost:54321/auth/v1/token
{
  "email": "demo@chordline.app",
  "password": "password123"
}
```

### 2. Weather API Integration
```bash
# Test weather lookup
GET http://localhost:8081/weather?q=Nashville&appid=mock_openweather_key_local
```

### 3. Spotify Integration
```bash
# Test artist search
GET http://localhost:8082/v1/search?q=midnight&type=artist
Authorization: Bearer mock_spotify_token_123
```

### 4. Database Operations
```sql
-- Connect to local DB
psql "postgresql://postgres:postgres@localhost:54322/postgres"

-- View test data
SELECT * FROM bands;
SELECT * FROM shows;
SELECT * FROM venues;
```

## 🔍 Testing User Flows

### Complete Show Creation Flow

1. **Login as demo user**
   - Email: `demo@chordline.app`
   - Password: `password123`

2. **Navigate to Shows page**
   - Should see existing test shows
   - Weather data should load for each show

3. **Create new show**
   - Select venue from dropdown (populated from mock venues)
   - Choose date (weather will be mocked)
   - Save and verify in database

4. **Test integrations**
   - Weather data appears automatically
   - Spotify search works for setlist songs
   - Calendar integration (if implemented)

### AI Assistant Testing

1. **Navigate to Assistant page**
2. **Test prompts:**
   - "Help me plan a summer tour"
   - "Create a social media post for our last show"
   - "Suggest songs for an acoustic set"

3. **Verify responses:**
   - Should get contextual responses from OpenRouter mock
   - Responses should be categorized correctly

## 🚨 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
netstat -ano | findstr :8080

# Kill process if needed
taskkill /PID <process_id> /F
```

**2. Supabase Won't Start**
```bash
# Reset and try again
npm run supabase:stop
npm run supabase:reset
npm run supabase:start
```

**3. Mock APIs Not Responding**
```bash
# Check if Node.js process is running
Get-Process -Name "node" | Where-Object {$_.Path -like "*mocks*"}

# Restart mock servers
npm run mocks:stop
npm run mocks:start
```

**4. Database Connection Issues**
```bash
# Check Supabase status
npm run supabase:status

# Restart if needed
npm run supabase:stop
npm run supabase:start
```

### Health Check Commands

```bash
# Overall stack health
PowerShell scripts/local-stack.ps1 health

# Individual service checks
curl http://localhost:8080/health
curl http://localhost:54321/health
```

### Logs and Debugging

```bash
# Supabase logs
npm run supabase:logs

# Mock server logs (check console where started)
npm run mocks:start

# Browser console
# Check Network tab for API calls
# Verify no external API calls are made
```

## 📊 Health Dashboard

The health dashboard is available at `/dev/health` when running in local mode:

### Features
- **Service Status**: Real-time status of all services
- **Endpoint Testing**: Quick API endpoint tests
- **Database Browser**: View test data
- **Mock Data Reset**: Reset to default test data
- **Configuration Display**: Current environment settings

### Usage
```bash
# Start app in local mode
npm run dev:mock

# Open health dashboard
# Navigate to http://localhost:5173/dev/health
```

## 🔄 Data Management

### Reset Test Data
```bash
# Reset database to seed data
npm run local:reset

# Or using PowerShell script
PowerShell scripts/local-stack.ps1 reset
```

### Add New Mock Data

**Add new venues:**
```sql
-- Connect to local database
psql "postgresql://postgres:postgres@localhost:54322/postgres"

-- Add venue
INSERT INTO venues (name, address, city, state, country, capacity) 
VALUES ('New Venue', '123 Music St', 'Nashville', 'TN', 'US', 300);
```

**Add new mock API responses:**
```javascript
// Edit mocks/openweather/routes.js
const weatherData = {
  'your-city': {
    // Add your mock weather data
  }
}
```

### Backup/Restore Data
```bash
# Backup current data
pg_dump "postgresql://postgres:postgres@localhost:54322/postgres" > backup.sql

# Restore from backup
psql "postgresql://postgres:postgres@localhost:54322/postgres" < backup.sql
```

## 🎯 Testing Best Practices

### 1. Environment Isolation
- Always use `.env.local` for local testing
- Verify no production API keys are used
- Check network requests don't hit external APIs

### 2. Data Consistency
- Reset data between test runs when needed
- Use consistent test data for reproducible results
- Document any test data changes

### 3. Service Dependencies
- Start services in correct order (DB → APIs → App)
- Verify all services are healthy before testing
- Test error scenarios (services down, network issues)

### 4. Performance Testing
- Monitor response times from mock services
- Test with realistic data volumes
- Verify database query performance

## 📞 Support

### Getting Help
1. **Check this documentation first**
2. **Run health checks**: `PowerShell scripts/local-stack.ps1 health`
3. **Check logs**: `npm run supabase:logs`
4. **Reset and retry**: `npm run local:reset`

### Common Commands Reference
```bash
# Start stack
PowerShell scripts/local-stack.ps1 start

# Stop stack
PowerShell scripts/local-stack.ps1 stop

# Check status
PowerShell scripts/local-stack.ps1 status

# Reset data
npm run local:reset

# Development mode
npm run dev:mock
```

---

*This Mode B local testing setup provides a production-like environment for development and testing without requiring external API keys or internet connectivity.*