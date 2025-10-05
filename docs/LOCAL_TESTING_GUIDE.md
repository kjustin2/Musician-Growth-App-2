# 🧪 Local Testing Guide - Musician Growth App

## Overview

This guide provides step-by-step instructions for setting up and testing the Musician Growth App locally using **Mode B** - a complete local development stack with Supabase local instance and mock external APIs.

## Prerequisites

### System Requirements
- **Node.js** 18+ (LTS recommended)
- **Docker Desktop** (for Supabase local instance)
- **Git** (for cloning and version control)
- **Modern web browser** (Chrome, Firefox, or Edge)

### Windows-Specific Requirements
- **PowerShell** 5.1+ or **PowerShell Core** 7+
- **Windows Terminal** (recommended for better experience)

### Verify Prerequisites
```powershell
# Check Node.js version
node --version
# Should output v18.x.x or higher

# Check Docker
docker --version
# Should output Docker version 20.x.x or higher

# Check npm
npm --version
# Should output 8.x.x or higher
```

## 🚀 Quick Start

### 1. Clone and Install Dependencies
```powershell
# Navigate to your development directory
cd C:\Users\[YourUsername]\Projects

# Clone the repository (if not already done)
git clone [repository-url] Musician-Growth-App-2
cd Musician-Growth-App-2

# Install dependencies
npm install
```

### 2. Environment Setup
```powershell
# Copy the local environment template
Copy-Item .env.example .env.local

# The .env.local should already be configured for Mode B testing
# Verify it contains local URLs:
# VITE_APP_MODE=local
# VITE_SUPABASE_URL=http://127.0.0.1:54321
# etc.
```

### 3. Start Local Services (In Order)

#### Step 3a: Start Docker Desktop
- Ensure Docker Desktop is running
- Wait for it to be fully initialized

#### Step 3b: Start Supabase Local Instance
```powershell
# Start Supabase with migrations and seed data
npm run supabase:start

# ✅ Success indicators:
# - "Started supabase local development setup"
# - API URL: http://127.0.0.1:54321
# - Studio URL: http://127.0.0.1:54323
# - Database seeded with test data
```

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
    Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
     Mailpit URL: http://127.0.0.1:54324
```

#### Step 3c: Start Mock API Servers
```powershell
# In a new PowerShell window/tab
npm run mocks:start

# ✅ Success indicators:
# - All 5 mock servers running on ports 8081-8085
# - Combined mock server on port 8080
# - Health check available at http://localhost:8080/health
```

**Expected Output:**
```
🧪 openweather mock server running on http://localhost:8081
🧪 spotify mock server running on http://localhost:8082
🧪 google-calendar mock server running on http://localhost:8083
🧪 openrouter mock server running on http://localhost:8084
🧪 mapbox mock server running on http://localhost:8085
🧪 Combined mock server running on http://localhost:8080

Health check: http://localhost:8080/health
```

#### Step 3d: Start Frontend Development Server
```powershell
# In a new PowerShell window/tab
npm run dev

# ✅ Success indicators:
# - Vite dev server starts
# - Local development server running on http://localhost:5173
# - Hot reload enabled
```

**Expected Output:**
```
  VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 🧪 Manual Browser Testing Checklist

### Health Check Verification
Before testing the app, verify all services are healthy:

1. **Mock Services Health**
   - Navigate to: http://localhost:8080/health
   - ✅ Should show: `{"status":"healthy","services":{"openweather":"running",...}}`

2. **Supabase Health**
   - Navigate to: http://localhost:54321/rest/v1/
   - ✅ Should show Supabase REST API documentation

3. **Frontend Application**
   - Navigate to: http://localhost:5173/
   - ✅ Should load the Musician Growth App homepage

### Core Functionality Testing

#### 1. **Homepage & Navigation** 📱
- [ ] App loads without errors
- [ ] Navigation menu is visible and functional
- [ ] Logo and branding display correctly
- [ ] Responsive design works on different screen sizes
- [ ] No console errors in browser developer tools

**Test Steps:**
```
1. Open http://localhost:5173/
2. Open browser DevTools (F12)
3. Check Console tab for errors
4. Test navigation links
5. Resize browser window to test responsiveness
```

#### 2. **Authentication Flow** 🔐
- [ ] Login form appears and is functional
- [ ] Can log in with test credentials
- [ ] User session persists on page refresh  
- [ ] Logout functionality works
- [ ] Protected routes redirect to login when not authenticated

**Test Credentials:**
- **Email**: `demo@chordline.app`
- **Password**: `password123`

**Test Steps:**
```
1. Click "Login" or "Sign In" button
2. Enter test credentials
3. Verify successful login and redirect
4. Refresh page - should remain logged in
5. Test logout functionality
6. Try accessing protected pages while logged out
```

#### 3. **Calendar Integration** 📅
- [ ] Calendar view loads and displays events
- [ ] Shows data from local Supabase database
- [ ] Can navigate between different time periods
- [ ] Events display correct information (date, time, venue)
- [ ] Mock weather data appears for shows

**Test Steps:**
```
1. Navigate to Calendar/Shows page
2. Verify shows from seed data are visible
3. Check event details display correctly
4. Test date navigation (prev/next month)
5. Verify weather info shows for past shows
```

#### 4. **Weather Widget** 🌤️
- [ ] Weather information displays for venues/shows
- [ ] Shows mock weather data from OpenWeather mock
- [ ] Temperature and conditions are realistic
- [ ] Weather icons/indicators work properly

**Expected Mock Data:**
- Nashville: Clear, 72°F
- New York: Cloudy, 65°F  
- San Francisco: Mist, 58°F
- Austin: Light rain, 78°F

#### 5. **AI Assistant** 🤖
- [ ] AI chat interface is accessible
- [ ] Can send messages to AI assistant
- [ ] Receives contextual responses from OpenRouter mock
- [ ] Different types of requests work (social media, planning, creative)
- [ ] Response time is reasonable

**Test Prompts:**
```
1. "Generate a social media caption for my Nashville show tonight"
2. "Help me plan a tour for next summer"
3. "Give me creative ideas for my setlist"
```

#### 6. **Data Management** 📊
- [ ] Shows and events display correctly
- [ ] Earnings data is visible and accurate
- [ ] Band information shows properly
- [ ] Venue details are complete
- [ ] Data relationships work (shows → venues, earnings → shows)

#### 7. **Mobile Responsiveness** 📱
Test on different viewport sizes:
- [ ] **Mobile Portrait** (375x667)
- [ ] **Mobile Landscape** (667x375)
- [ ] **Tablet** (768x1024)
- [ ] **Desktop** (1920x1080)

**Test Steps:**
```
1. Open browser DevTools (F12)
2. Click device emulation icon
3. Test different device presets
4. Verify UI adapts properly
5. Test touch interactions work
```

### Performance Testing

#### Load Time Assessment
- [ ] Initial page load < 3 seconds
- [ ] Navigation between pages < 1 second
- [ ] API responses < 500ms (mock data)
- [ ] Images and assets load quickly
- [ ] No layout shift during load

#### Network Tab Verification
```
1. Open DevTools → Network tab
2. Refresh the page
3. Check for:
   - Failed requests (should be none)
   - Large asset sizes (optimize if needed)
   - Unnecessary duplicate requests
   - Proper caching headers
```

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### **Issue: Supabase fails to start**
```
Error: Docker is not running
```
**Solution:**
1. Ensure Docker Desktop is running
2. Wait for Docker to fully initialize
3. Try: `npm run supabase:start` again

#### **Issue: Mock servers not responding**
```
Error: ECONNREFUSED localhost:8080
```
**Solution:**
1. Check if mock servers are running: `npm run mocks:start`
2. Verify ports 8080-8085 are not in use by other applications
3. Restart mock servers if needed

#### **Issue: Frontend app won't start**
```
Error: EADDRINUSE :::5173
```
**Solution:**
1. Port 5173 is in use by another process
2. Kill the process or use a different port: `npm run dev -- --port 3001`

#### **Issue: Database connection errors**
```
Error: connect ECONNREFUSED 127.0.0.1:54322
```
**Solution:**
1. Ensure Supabase is running: `npm run supabase:status`
2. Restart Supabase: `npm run supabase:stop && npm run supabase:start`
3. Check Docker containers are healthy

#### **Issue: Authentication not working**
```
Error: Invalid JWT token
```
**Solution:**
1. Check environment variables in `.env.local`
2. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. Restart the dev server after env changes

### Service Status Commands

```powershell
# Check Supabase status
npm run supabase:status

# View Supabase logs
npm run local:logs

# Stop all services
npm run local:stop

# Reset database (clears all data)
npm run local:reset
```

## 📊 Service Endpoints Reference

| Service | URL | Purpose | Health Check |
|---------|-----|---------|--------------|
| **Frontend App** | http://localhost:5173 | Main application | Visit homepage |
| **Supabase API** | http://localhost:54321 | Database & Auth | `/rest/v1/` |
| **Supabase Studio** | http://localhost:54323 | Database admin UI | Web interface |
| **Mock Weather** | http://localhost:8081 | OpenWeather API mock | `/health` |
| **Mock Spotify** | http://localhost:8082 | Spotify API mock | `/health` |
| **Mock Calendar** | http://localhost:8083 | Google Calendar mock | `/health` |
| **Mock AI** | http://localhost:8084 | OpenRouter AI mock | `/health` |
| **Mock Mapbox** | http://localhost:8085 | Mapbox API mock | `/health` |
| **Mock Health** | http://localhost:8080 | Combined health check | `/health` |

## 🎯 Test Data Available

### Demo Users
- **Email**: `demo@chordline.app` | **Password**: `password123`
- **Email**: `sarah.songwriter@music.com` | **Password**: `password123`

### Sample Bands
- **The Midnight Echoes** (Indie folk rock)
- **Electric Sunrise** (Electronic pop duo)
- **The Wandering Minstrels** (Acoustic folk trio)
- **Neon Nights** (Synthwave)

### Sample Venues
- The Bluebird Cafe (Nashville)
- Mercury Lounge (New York)
- The Troubadour (West Hollywood)
- Red Rocks Amphitheatre (Colorado)

### Sample Shows
- **Past shows** with earnings data and weather
- **Upcoming shows** for testing future functionality
- **Complete setlists** with song information

## 📝 Testing Notes

### What to Look For
✅ **Good Signs:**
- Fast page loads and smooth navigation
- No JavaScript errors in console
- Responsive design works across devices
- Authentication flows complete successfully
- Mock data displays appropriately
- Weather and AI features respond correctly

❌ **Red Flags:**
- Console errors or warnings
- Broken layouts on different screen sizes
- Failed network requests
- Authentication issues
- Missing or incorrect data
- Slow response times

### Browser DevTools Tips
```
1. Console Tab: Check for JavaScript errors
2. Network Tab: Monitor API requests and response times
3. Application Tab: Inspect local storage and session data
4. Security Tab: Verify HTTPS and certificate issues
5. Lighthouse Tab: Run performance audits
```

## 🔄 Development Workflow

### Making Changes
1. Make code changes in your editor
2. Frontend changes auto-reload (hot module replacement)
3. Backend/database changes require restart:
   ```powershell
   npm run supabase:stop
   npm run supabase:start
   ```

### Testing Changes
1. Test manually in browser
2. Run automated tests: `npm run test`
3. Run Playwright tests: `npm run test:mcp`

### Common Development Tasks
```powershell
# Add new migration
npm run supabase:migration new "migration_name"

# Reset database and reseed
npm run supabase:reset

# Generate TypeScript types from database
npm run generate-types

# Stop all services
npm run local:stop
```

---

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check the logs** for specific error messages
2. **Verify all prerequisites** are properly installed
3. **Restart services** in the correct order
4. **Check network/firewall settings** that might block local ports
5. **Review the console** for detailed error information

**Service Restart Order:**
1. Stop all services: `npm run local:stop`
2. Start Supabase: `npm run supabase:start`
3. Start mocks: `npm run mocks:start`  
4. Start frontend: `npm run dev`

Remember: The local stack is designed to be completely self-contained and work offline once started!