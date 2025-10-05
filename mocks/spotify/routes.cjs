const express = require('express');
const router = express.Router();

// Mock Spotify data
const mockArtists = [
  {
    id: 'artist_1',
    name: 'The Midnight Echoes',
    type: 'artist',
    genres: ['indie rock', 'folk rock', 'alternative'],
    popularity: 65,
    followers: { href: null, total: 12500 },
    images: [
      { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=640&fit=crop', width: 640, height: 640 },
      { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', width: 300, height: 300 }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/artist_1' }
  },
  {
    id: 'artist_2',
    name: 'Electric Sunrise',
    type: 'artist',
    genres: ['electronic', 'synthpop', 'indie electronic'],
    popularity: 72,
    followers: { href: null, total: 18200 },
    images: [
      { url: 'https://images.unsplash.com/photo-1571266028243-d220c0a9db29?w=640&h=640&fit=crop', width: 640, height: 640 },
      { url: 'https://images.unsplash.com/photo-1571266028243-d220c0a9db29?w=300&h=300&fit=crop', width: 300, height: 300 }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/artist_2' }
  },
  {
    id: 'artist_3',
    name: 'The Wandering Minstrels',
    type: 'artist',
    genres: ['folk', 'acoustic', 'indie folk'],
    popularity: 58,
    followers: { href: null, total: 8900 },
    images: [
      { url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c726?w=640&h=640&fit=crop', width: 640, height: 640 },
      { url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c726?w=300&h=300&fit=crop', width: 300, height: 300 }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/artist_3' }
  }
];

const mockTracks = [
  {
    id: 'track_1',
    name: 'Whispers in the Dark',
    artists: [{ id: 'artist_1', name: 'The Midnight Echoes' }],
    album: {
      id: 'album_1',
      name: 'Midnight Sessions',
      images: [
        { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=640&fit=crop', width: 640, height: 640 }
      ],
      release_date: '2024-01-15'
    },
    duration_ms: 245000,
    popularity: 78,
    preview_url: null,
    track_number: 1,
    type: 'track',
    external_urls: { spotify: 'https://open.spotify.com/track/track_1' }
  },
  {
    id: 'track_2',
    name: 'Neon Lights',
    artists: [{ id: 'artist_2', name: 'Electric Sunrise' }],
    album: {
      id: 'album_2',
      name: 'Digital Dreams',
      images: [
        { url: 'https://images.unsplash.com/photo-1571266028243-d220c0a9db29?w=640&h=640&fit=crop', width: 640, height: 640 }
      ],
      release_date: '2024-03-22'
    },
    duration_ms: 312000,
    popularity: 82,
    preview_url: null,
    track_number: 1,
    type: 'track',
    external_urls: { spotify: 'https://open.spotify.com/track/track_2' }
  },
  {
    id: 'track_3',
    name: 'The Traveler\'s Song',
    artists: [{ id: 'artist_3', name: 'The Wandering Minstrels' }],
    album: {
      id: 'album_3',
      name: 'Folk Tales',
      images: [
        { url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c726?w=640&h=640&fit=crop', width: 640, height: 640 }
      ],
      release_date: '2023-11-08'
    },
    duration_ms: 234000,
    popularity: 65,
    preview_url: null,
    track_number: 1,
    type: 'track',
    external_urls: { spotify: 'https://open.spotify.com/track/track_3' }
  }
];

const mockPlaylists = [
  {
    id: 'playlist_1',
    name: 'Indie Rock Rising',
    description: 'The best up-and-coming indie rock artists',
    public: true,
    followers: { href: null, total: 45231 },
    images: [
      { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', width: 300, height: 300 }
    ],
    owner: { display_name: 'Spotify', id: 'spotify' },
    tracks: { href: '/playlists/playlist_1/tracks', total: 52 },
    type: 'playlist',
    external_urls: { spotify: 'https://open.spotify.com/playlist/playlist_1' }
  }
];

// Authentication middleware (mock)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'No token provided'
      }
    });
  }
  
  if (!token.startsWith('mock_spotify_token')) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Invalid access token'
      }
    });
  }
  
  // Mock user data
  req.user = {
    id: 'mock_user_123',
    display_name: 'Demo User',
    email: 'demo@chordline.app'
  };
  
  next();
};

// OAuth token endpoint (mock)
router.post('/api/token', (req, res) => {
  const { grant_type, code, refresh_token, client_id, client_secret } = req.body;
  
  // Mock token response
  res.json({
    access_token: `mock_spotify_token_${Date.now()}`,
    token_type: 'Bearer',
    scope: 'user-read-private user-read-email user-library-read playlist-read-private user-top-read',
    expires_in: 3600,
    refresh_token: `mock_refresh_token_${Date.now()}`
  });
});

// User profile endpoint
router.get('/v1/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    display_name: req.user.display_name,
    email: req.user.email,
    country: 'US',
    product: 'premium',
    followers: { href: null, total: 42 },
    images: [
      { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop', width: 300, height: 300 }
    ],
    external_urls: { spotify: `https://open.spotify.com/user/${req.user.id}` }
  });
});

// Search endpoint
router.get('/v1/search', (req, res) => {
  const { q: query, type, limit = 20, offset = 0 } = req.query;
  
  if (!query) {
    return res.status(400).json({
      error: {
        status: 400,
        message: 'No search query provided'
      }
    });
  }
  
  const types = type ? type.split(',') : ['track'];
  const searchResults = {};
  
  if (types.includes('artist')) {
    const filteredArtists = mockArtists.filter(artist =>
      artist.name.toLowerCase().includes(query.toLowerCase())
    ).slice(offset, offset + parseInt(limit));
    
    searchResults.artists = {
      href: `/v1/search?q=${encodeURIComponent(query)}&type=artist&offset=${offset}&limit=${limit}`,
      items: filteredArtists,
      limit: parseInt(limit),
      next: null,
      offset: parseInt(offset),
      previous: null,
      total: filteredArtists.length
    };
  }
  
  if (types.includes('track')) {
    const filteredTracks = mockTracks.filter(track =>
      track.name.toLowerCase().includes(query.toLowerCase()) ||
      track.artists.some(artist => artist.name.toLowerCase().includes(query.toLowerCase()))
    ).slice(offset, offset + parseInt(limit));
    
    searchResults.tracks = {
      href: `/v1/search?q=${encodeURIComponent(query)}&type=track&offset=${offset}&limit=${limit}`,
      items: filteredTracks,
      limit: parseInt(limit),
      next: null,
      offset: parseInt(offset),
      previous: null,
      total: filteredTracks.length
    };
  }
  
  if (types.includes('playlist')) {
    const filteredPlaylists = mockPlaylists.filter(playlist =>
      playlist.name.toLowerCase().includes(query.toLowerCase()) ||
      playlist.description.toLowerCase().includes(query.toLowerCase())
    ).slice(offset, offset + parseInt(limit));
    
    searchResults.playlists = {
      href: `/v1/search?q=${encodeURIComponent(query)}&type=playlist&offset=${offset}&limit=${limit}`,
      items: filteredPlaylists,
      limit: parseInt(limit),
      next: null,
      offset: parseInt(offset),
      previous: null,
      total: filteredPlaylists.length
    };
  }
  
  res.json(searchResults);
});

// Get artist by ID
router.get('/v1/artists/:id', (req, res) => {
  const artist = mockArtists.find(a => a.id === req.params.id);
  
  if (!artist) {
    return res.status(404).json({
      error: {
        status: 404,
        message: 'Artist not found'
      }
    });
  }
  
  res.json(artist);
});

// Get artist's top tracks
router.get('/v1/artists/:id/top-tracks', (req, res) => {
  const { market = 'US' } = req.query;
  const artist = mockArtists.find(a => a.id === req.params.id);
  
  if (!artist) {
    return res.status(404).json({
      error: {
        status: 404,
        message: 'Artist not found'
      }
    });
  }
  
  const topTracks = mockTracks.filter(track =>
    track.artists.some(a => a.id === req.params.id)
  );
  
  res.json({
    tracks: topTracks
  });
});

// Get user's top tracks
router.get('/v1/me/top/tracks', authenticateToken, (req, res) => {
  const { limit = 20, offset = 0, time_range = 'medium_term' } = req.query;
  
  const topTracks = mockTracks.slice(offset, offset + parseInt(limit));
  
  res.json({
    href: `/v1/me/top/tracks?limit=${limit}&offset=${offset}`,
    items: topTracks,
    limit: parseInt(limit),
    next: null,
    offset: parseInt(offset),
    previous: null,
    total: mockTracks.length
  });
});

// Get user's top artists
router.get('/v1/me/top/artists', authenticateToken, (req, res) => {
  const { limit = 20, offset = 0, time_range = 'medium_term' } = req.query;
  
  const topArtists = mockArtists.slice(offset, offset + parseInt(limit));
  
  res.json({
    href: `/v1/me/top/artists?limit=${limit}&offset=${offset}`,
    items: topArtists,
    limit: parseInt(limit),
    next: null,
    offset: parseInt(offset),
    previous: null,
    total: mockArtists.length
  });
});

// Get user's playlists
router.get('/v1/me/playlists', authenticateToken, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const userPlaylists = mockPlaylists.slice(offset, offset + parseInt(limit));
  
  res.json({
    href: `/v1/me/playlists?limit=${limit}&offset=${offset}`,
    items: userPlaylists,
    limit: parseInt(limit),
    next: null,
    offset: parseInt(offset),
    previous: null,
    total: mockPlaylists.length
  });
});

// Get track by ID
router.get('/v1/tracks/:id', (req, res) => {
  const track = mockTracks.find(t => t.id === req.params.id);
  
  if (!track) {
    return res.status(404).json({
      error: {
        status: 404,
        message: 'Track not found'
      }
    });
  }
  
  res.json(track);
});

// Get multiple tracks
router.get('/v1/tracks', (req, res) => {
  const { ids } = req.query;
  
  if (!ids) {
    return res.status(400).json({
      error: {
        status: 400,
        message: 'No track IDs provided'
      }
    });
  }
  
  const trackIds = ids.split(',');
  const tracks = trackIds.map(id => mockTracks.find(t => t.id === id)).filter(Boolean);
  
  res.json({
    tracks
  });
});

// Artist analytics endpoint (Spotify for Artists API mock)
router.get('/v1/artists/:id/insights/streams', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  res.json({
    data: [
      {
        date: '2024-01-01',
        streams: 1250,
        listeners: 980
      },
      {
        date: '2024-01-02',
        streams: 1450,
        listeners: 1120
      },
      {
        date: '2024-01-03',
        streams: 1680,
        listeners: 1300
      }
    ],
    total_streams: 15420,
    total_listeners: 8950,
    period: {
      start: start_date,
      end: end_date
    }
  });
});

// Error handler for undefined routes
router.use((req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: `Endpoint not found: ${req.method} ${req.path}`
    }
  });
});

module.exports = router;