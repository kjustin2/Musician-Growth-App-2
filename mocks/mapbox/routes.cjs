const express = require('express');
const router = express.Router();

// Mock geocoding data for venues and locations
const mockGeocodingData = {
  'nashville': {
    features: [
      {
        id: 'place.nashville',
        type: 'Feature',
        place_name: 'Nashville, Tennessee, United States',
        properties: {
          wikidata: 'Q23197'
        },
        text: 'Nashville',
        geometry: {
          type: 'Point',
          coordinates: [-86.7816, 36.1627]
        },
        context: [
          { id: 'region.tennessee', text: 'Tennessee' },
          { id: 'country.us', text: 'United States' }
        ]
      }
    ],
    query: ['nashville']
  },
  'new york': {
    features: [
      {
        id: 'place.newyork',
        type: 'Feature',
        place_name: 'New York, New York, United States',
        properties: {
          wikidata: 'Q60'
        },
        text: 'New York',
        geometry: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128]
        },
        context: [
          { id: 'region.newyork', text: 'New York' },
          { id: 'country.us', text: 'United States' }
        ]
      }
    ],
    query: ['new', 'york']
  },
  'bluebird cafe': {
    features: [
      {
        id: 'poi.bluebird',
        type: 'Feature',
        place_name: 'The Bluebird Cafe, 4104 Hillsboro Pike, Nashville, Tennessee 37215, United States',
        properties: {
          category: 'music venue',
          maki: 'music'
        },
        text: 'The Bluebird Cafe',
        geometry: {
          type: 'Point',
          coordinates: [-86.8280, 36.1073]
        },
        context: [
          { id: 'address.4104', text: '4104 Hillsboro Pike' },
          { id: 'place.nashville', text: 'Nashville' },
          { id: 'region.tennessee', text: 'Tennessee' },
          { id: 'country.us', text: 'United States' }
        ]
      }
    ],
    query: ['bluebird', 'cafe']
  }
};

// Mock directions data
const mockDirections = {
  routes: [
    {
      distance: 15234.5, // meters
      duration: 1324.2, // seconds
      geometry: 'mockGeometryString123',
      legs: [
        {
          distance: 15234.5,
          duration: 1324.2,
          steps: [
            {
              distance: 245.8,
              duration: 45.2,
              geometry: 'stepGeometry1',
              maneuver: {
                type: 'depart',
                instruction: 'Head north on Main Street',
                bearing_after: 0,
                bearing_before: 0,
                location: [-86.7816, 36.1627]
              }
            },
            {
              distance: 523.1,
              duration: 67.5,
              geometry: 'stepGeometry2',
              maneuver: {
                type: 'turn',
                instruction: 'Turn right onto Music Row',
                bearing_after: 90,
                bearing_before: 0,
                location: [-86.7800, 36.1640]
              }
            }
          ]
        }
      ]
    }
  ],
  waypoints: [
    {
      distance: 0,
      name: 'Start Location',
      location: [-86.7816, 36.1627]
    },
    {
      distance: 15234.5,
      name: 'End Location',
      location: [-86.8280, 36.1073]
    }
  ],
  code: 'Ok',
  uuid: `mock-uuid-${Date.now()}`
};

// Mock static map URLs
const generateStaticMapUrl = (params) => {
  const { lon, lat, zoom = 14, width = 600, height = 400, marker } = params;
  
  // Return a placeholder image URL for testing
  let url = `https://via.placeholder.com/${width}x${height}/2196F3/FFFFFF?text=Map+${lat},${lon}`;
  
  if (marker) {
    url += `+Marker`;
  }
  
  return url;
};

// Geocoding endpoint (forward)
router.get('/geocoding/v5/mapbox.places/:query.json', (req, res) => {
  const query = req.params.query.toLowerCase();
  const { access_token, limit = 5, proximity, bbox, country, types } = req.query;
  
  if (!access_token) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  if (!access_token.startsWith('mock_mapbox_token')) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  // Find matching mock data
  const mockData = mockGeocodingData[query];
  
  if (mockData) {
    const response = {
      type: 'FeatureCollection',
      features: mockData.features.slice(0, parseInt(limit)),
      query: mockData.query,
      attribution: 'Mock Mapbox Geocoding API'
    };
    
    res.json(response);
  } else {
    // Return generic location for unknown queries
    res.json({
      type: 'FeatureCollection',
      features: [
        {
          id: `place.${query.replace(/\s+/g, '')}`,
          type: 'Feature',
          place_name: `${query.charAt(0).toUpperCase() + query.slice(1)}, United States`,
          properties: {},
          text: query.charAt(0).toUpperCase() + query.slice(1),
          geometry: {
            type: 'Point',
            coordinates: [-95.7129, 37.0902] // Geographic center of US
          },
          context: [
            { id: 'country.us', text: 'United States' }
          ]
        }
      ],
      query: query.split(' '),
      attribution: 'Mock Mapbox Geocoding API'
    });
  }
});

// Reverse geocoding endpoint
router.get('/geocoding/v5/mapbox.places/:longitude,:latitude.json', (req, res) => {
  const { longitude, latitude } = req.params;
  const { access_token, types, limit = 1 } = req.query;
  
  if (!access_token) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  if (!access_token.startsWith('mock_mapbox_token')) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  const lon = parseFloat(longitude);
  const lat = parseFloat(latitude);
  
  // Mock reverse geocoding response
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        id: `address.${Date.now()}`,
        type: 'Feature',
        place_name: `123 Mock Street, Sample City, State 12345, United States`,
        properties: {},
        text: '123 Mock Street',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        context: [
          { id: 'locality.samplecity', text: 'Sample City' },
          { id: 'region.state', text: 'State' },
          { id: 'country.us', text: 'United States' }
        ]
      }
    ],
    query: [longitude, latitude],
    attribution: 'Mock Mapbox Geocoding API'
  });
});

// Directions endpoint
router.get('/directions/v5/mapbox/:profile/:coordinates', (req, res) => {
  const { profile, coordinates } = req.params;
  const { access_token, geometries = 'geojson', overview = 'full', steps = 'true' } = req.query;
  
  if (!access_token) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  if (!access_token.startsWith('mock_mapbox_token')) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  // Parse coordinates
  const coordPairs = coordinates.split(';');
  if (coordPairs.length < 2) {
    return res.status(400).json({
      message: 'At least two coordinates are required'
    });
  }
  
  // Generate mock route based on coordinates
  const startCoord = coordPairs[0].split(',').map(Number);
  const endCoord = coordPairs[coordPairs.length - 1].split(',').map(Number);
  
  const distance = Math.random() * 50000 + 1000; // 1-50km
  const duration = distance / 15; // ~15 m/s average speed
  
  const response = {
    ...mockDirections,
    routes: [
      {
        ...mockDirections.routes[0],
        distance: distance,
        duration: duration,
        legs: [
          {
            distance: distance,
            duration: duration,
            steps: steps === 'true' ? mockDirections.routes[0].legs[0].steps : undefined
          }
        ]
      }
    ],
    waypoints: [
      {
        distance: 0,
        name: '',
        location: startCoord
      },
      {
        distance: distance,
        name: '',
        location: endCoord
      }
    ]
  };
  
  res.json(response);
});

// Static maps endpoint
router.get('/styles/v1/mapbox/:style_id/static/:overlay/:coordinates/:dimensions', (req, res) => {
  const { style_id, overlay, coordinates, dimensions } = req.params;
  
  // Parse coordinates (lon,lat,zoom)
  const [lon, lat, zoom] = coordinates.split(',');
  
  // Parse dimensions (widthxheight)
  const dimensionMatch = dimensions.match(/(\d+)x(\d+)/);
  if (!dimensionMatch) {
    return res.status(400).json({ message: 'Invalid dimensions format' });
  }
  const [, width, height] = dimensionMatch;
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  if (!access_token.startsWith('mock_mapbox_token')) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  // Generate mock static map URL
  const mapUrl = generateStaticMapUrl({
    lon: parseFloat(lon),
    lat: parseFloat(lat),
    zoom: parseInt(zoom),
    width: parseInt(width),
    height: parseInt(height),
    marker: overlay.includes('pin')
  });
  
  // Redirect to placeholder image
  res.redirect(mapUrl);
});

// Tilesets endpoint (for custom map styles)
router.get('/tilesets/v1/:username/:tileset_id', (req, res) => {
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  res.json({
    id: `${req.params.username}.${req.params.tileset_id}`,
    name: 'Mock Tileset',
    description: 'Mock tileset for local testing',
    attribution: 'Mock Mapbox Data',
    bounds: [-180, -85, 180, 85],
    center: [0, 0],
    minzoom: 0,
    maxzoom: 14,
    created: new Date().toISOString(),
    modified: new Date().toISOString()
  });
});

// Matrix API (for travel time matrices)
router.get('/directions-matrix/v1/mapbox/:profile/:coordinates', (req, res) => {
  const { coordinates } = req.params;
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  const coordPairs = coordinates.split(';');
  const numCoords = coordPairs.length;
  
  // Generate mock distance and duration matrices
  const distances = [];
  const durations = [];
  
  for (let i = 0; i < numCoords; i++) {
    distances[i] = [];
    durations[i] = [];
    for (let j = 0; j < numCoords; j++) {
      if (i === j) {
        distances[i][j] = 0;
        durations[i][j] = 0;
      } else {
        const distance = Math.random() * 50000 + 1000;
        distances[i][j] = distance;
        durations[i][j] = distance / 15; // ~15 m/s average
      }
    }
  }
  
  res.json({
    distances: distances,
    durations: durations,
    sources: coordPairs.map((coord, index) => ({
      distance: 0,
      location: coord.split(',').map(Number)
    })),
    destinations: coordPairs.map((coord, index) => ({
      distance: 0,
      location: coord.split(',').map(Number)
    })),
    code: 'Ok'
  });
});

// Map Matching API (for GPS trace snapping)
router.get('/matching/v5/mapbox/:profile/:coordinates', (req, res) => {
  const { coordinates } = req.params;
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(401).json({
      message: 'Not Authorized - Invalid Token'
    });
  }
  
  res.json({
    matchings: [
      {
        confidence: 0.95,
        distance: Math.random() * 10000 + 500,
        duration: Math.random() * 1200 + 60,
        geometry: 'mockMatchedGeometry123',
        legs: [],
        weight: 1.0,
        weight_name: 'routability'
      }
    ],
    tracepoints: coordinates.split(';').map((coord, index) => ({
      alternatives_count: 0,
      waypoint_index: index,
      matchings_index: 0,
      distance: 0,
      name: '',
      location: coord.split(',').map(Number)
    }))
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mapbox-mock',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;