const express = require('express');
const router = express.Router();

// Mock calendar data
const mockCalendars = [
  {
    id: 'primary',
    summary: 'Demo User',
    description: 'Primary calendar',
    timeZone: 'America/Chicago',
    kind: 'calendar#calendar',
    etag: '"mock-etag-1"'
  },
  {
    id: 'band-calendar@example.com',
    summary: 'The Midnight Echoes',
    description: 'Band events and shows',
    timeZone: 'America/Chicago',
    kind: 'calendar#calendar',
    etag: '"mock-etag-2"'
  }
];

const mockEvents = [
  {
    id: 'event_1',
    summary: 'Show at The Bluebird Cafe',
    description: 'Acoustic set at Nashville\'s iconic venue',
    start: {
      dateTime: '2024-12-15T20:00:00-06:00',
      timeZone: 'America/Chicago'
    },
    end: {
      dateTime: '2024-12-15T22:00:00-06:00',
      timeZone: 'America/Chicago'
    },
    location: 'The Bluebird Cafe, 4104 Hillsboro Pike, Nashville, TN',
    status: 'confirmed',
    kind: 'calendar#event',
    etag: '"mock-event-etag-1"',
    created: '2024-01-01T12:00:00.000Z',
    updated: '2024-01-01T12:00:00.000Z'
  },
  {
    id: 'event_2',
    summary: 'Rehearsal',
    description: 'Band practice session',
    start: {
      dateTime: '2024-12-18T19:00:00-06:00',
      timeZone: 'America/Chicago'
    },
    end: {
      dateTime: '2024-12-18T21:00:00-06:00',
      timeZone: 'America/Chicago'
    },
    location: 'Practice Studio B, 123 Music Row, Nashville, TN',
    status: 'confirmed',
    kind: 'calendar#event',
    etag: '"mock-event-etag-2"',
    created: '2024-01-01T12:00:00.000Z',
    updated: '2024-01-01T12:00:00.000Z'
  }
];

// Authentication middleware (mock)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: {
        code: 401,
        message: 'Unauthorized'
      }
    });
  }
  
  if (!token.startsWith('mock_google_token')) {
    return res.status(401).json({
      error: {
        code: 401,
        message: 'Invalid access token'
      }
    });
  }
  
  next();
};

// List calendars
router.get('/calendar/v3/users/me/calendarList', authenticateToken, (req, res) => {
  res.json({
    kind: 'calendar#calendarList',
    etag: '"mock-calendar-list-etag"',
    items: mockCalendars
  });
});

// Get calendar details
router.get('/calendar/v3/calendars/:calendarId', authenticateToken, (req, res) => {
  const calendar = mockCalendars.find(cal => cal.id === req.params.calendarId);
  
  if (!calendar) {
    return res.status(404).json({
      error: {
        code: 404,
        message: 'Calendar not found'
      }
    });
  }
  
  res.json(calendar);
});

// List events
router.get('/calendar/v3/calendars/:calendarId/events', authenticateToken, (req, res) => {
  const { timeMin, timeMax, maxResults = 250 } = req.query;
  
  let filteredEvents = [...mockEvents];
  
  // Filter by time range if provided
  if (timeMin) {
    const minTime = new Date(timeMin);
    filteredEvents = filteredEvents.filter(event => 
      new Date(event.start.dateTime) >= minTime
    );
  }
  
  if (timeMax) {
    const maxTime = new Date(timeMax);
    filteredEvents = filteredEvents.filter(event => 
      new Date(event.start.dateTime) <= maxTime
    );
  }
  
  // Limit results
  filteredEvents = filteredEvents.slice(0, parseInt(maxResults));
  
  res.json({
    kind: 'calendar#events',
    etag: '"mock-events-etag"',
    summary: req.params.calendarId,
    updated: new Date().toISOString(),
    timeZone: 'America/Chicago',
    items: filteredEvents
  });
});

// Get single event
router.get('/calendar/v3/calendars/:calendarId/events/:eventId', authenticateToken, (req, res) => {
  const event = mockEvents.find(evt => evt.id === req.params.eventId);
  
  if (!event) {
    return res.status(404).json({
      error: {
        code: 404,
        message: 'Event not found'
      }
    });
  }
  
  res.json(event);
});

// Create event
router.post('/calendar/v3/calendars/:calendarId/events', authenticateToken, (req, res) => {
  const newEvent = {
    id: `event_${Date.now()}`,
    ...req.body,
    kind: 'calendar#event',
    etag: `"mock-event-etag-${Date.now()}"`,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    status: req.body.status || 'confirmed'
  };
  
  mockEvents.push(newEvent);
  
  res.status(201).json(newEvent);
});

// Update event
router.put('/calendar/v3/calendars/:calendarId/events/:eventId', authenticateToken, (req, res) => {
  const eventIndex = mockEvents.findIndex(evt => evt.id === req.params.eventId);
  
  if (eventIndex === -1) {
    return res.status(404).json({
      error: {
        code: 404,
        message: 'Event not found'
      }
    });
  }
  
  const updatedEvent = {
    ...mockEvents[eventIndex],
    ...req.body,
    updated: new Date().toISOString(),
    etag: `"mock-event-etag-${Date.now()}"`
  };
  
  mockEvents[eventIndex] = updatedEvent;
  
  res.json(updatedEvent);
});

// Delete event
router.delete('/calendar/v3/calendars/:calendarId/events/:eventId', authenticateToken, (req, res) => {
  const eventIndex = mockEvents.findIndex(evt => evt.id === req.params.eventId);
  
  if (eventIndex === -1) {
    return res.status(404).json({
      error: {
        code: 404,
        message: 'Event not found'
      }
    });
  }
  
  mockEvents.splice(eventIndex, 1);
  res.status(204).send();
});

// Quick add event (natural language)
router.post('/calendar/v3/calendars/:calendarId/events/quickAdd', authenticateToken, (req, res) => {
  const { text } = req.query;
  
  if (!text) {
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Text parameter is required'
      }
    });
  }
  
  // Simple parsing of natural language (very basic)
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  
  const quickEvent = {
    id: `quick_event_${Date.now()}`,
    summary: text,
    start: {
      dateTime: now.toISOString(),
      timeZone: 'America/Chicago'
    },
    end: {
      dateTime: oneHourLater.toISOString(),
      timeZone: 'America/Chicago'
    },
    status: 'confirmed',
    kind: 'calendar#event',
    etag: `"mock-quick-event-etag-${Date.now()}"`,
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  
  mockEvents.push(quickEvent);
  
  res.json(quickEvent);
});

// Freebusy query
router.post('/calendar/v3/freeBusy', authenticateToken, (req, res) => {
  const { timeMin, timeMax, items } = req.body;
  
  const calendars = {};
  
  items.forEach(item => {
    const calendarId = item.id;
    
    // Find busy times for this calendar
    const busyTimes = mockEvents
      .filter(event => {
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);
        const queryStart = new Date(timeMin);
        const queryEnd = new Date(timeMax);
        
        return eventStart < queryEnd && eventEnd > queryStart;
      })
      .map(event => ({
        start: event.start.dateTime,
        end: event.end.dateTime
      }));
    
    calendars[calendarId] = {
      busy: busyTimes,
      errors: []
    };
  });
  
  res.json({
    kind: 'calendar#freeBusy',
    timeMin,
    timeMax,
    calendars
  });
});

// OAuth token endpoint (mock)
router.post('/oauth2/v4/token', (req, res) => {
  const { grant_type, code, refresh_token, client_id, client_secret } = req.body;
  
  res.json({
    access_token: `mock_google_token_${Date.now()}`,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: `mock_google_refresh_${Date.now()}`,
    scope: 'https://www.googleapis.com/auth/calendar'
  });
});

module.exports = router;