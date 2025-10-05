const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Import mock handlers
const openweatherRoutes = require('./openweather/routes.cjs');
const spotifyRoutes = require('./spotify/routes.cjs');
const googleCalendarRoutes = require('./google-calendar/routes.cjs');
const openrouterRoutes = require('./openrouter/routes.cjs');
const mapboxRoutes = require('./mapbox/routes.cjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      openweather: 'running',
      spotify: 'running',
      'google-calendar': 'running',
      openrouter: 'running',
      mapbox: 'running'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount service routes
app.use('/openweather', openweatherRoutes);
app.use('/spotify', spotifyRoutes);
app.use('/google-calendar', googleCalendarRoutes);
app.use('/openrouter', openrouterRoutes);
app.use('/mapbox', mapboxRoutes);

// Default 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Mock endpoint not found',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Mock server error:', err);
  res.status(500).json({
    error: 'Internal mock server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start servers for each service on different ports
const services = [
  { name: 'openweather', port: 8081 },
  { name: 'spotify', port: 8082 },
  { name: 'google-calendar', port: 8083 },
  { name: 'openrouter', port: 8084 },
  { name: 'mapbox', port: 8085 }
];

// Create individual service servers
services.forEach(({ name, port }) => {
  const serviceApp = express();
  serviceApp.use(cors());
  serviceApp.use(express.json());
  serviceApp.use(express.urlencoded({ extended: true }));
  
  // Logging
  serviceApp.use((req, res, next) => {
    console.log(`[${name}:${port}] ${req.method} ${req.path}`);
    next();
  });
  
  // Mount the specific service routes
  switch (name) {
    case 'openweather':
      serviceApp.use('/', openweatherRoutes);
      break;
    case 'spotify':
      serviceApp.use('/', spotifyRoutes);
      break;
    case 'google-calendar':
      serviceApp.use('/', googleCalendarRoutes);
      break;
    case 'openrouter':
      serviceApp.use('/', openrouterRoutes);
      break;
    case 'mapbox':
      serviceApp.use('/', mapboxRoutes);
      break;
  }
  
  serviceApp.listen(port, () => {
    console.log(`🧪 ${name} mock server running on http://localhost:${port}`);
  });
});

// Start the combined server on port 8080
const COMBINED_PORT = 8080;
app.listen(COMBINED_PORT, () => {
  console.log(`🧪 Combined mock server running on http://localhost:${COMBINED_PORT}`);
  console.log('\nAvailable services:');
  services.forEach(({ name, port }) => {
    console.log(`  - ${name}: http://localhost:${port}`);
  });
  console.log(`  - combined: http://localhost:${COMBINED_PORT}/${'{service}'}`);
  console.log('\nHealth check: http://localhost:8080/health');
});

module.exports = app;