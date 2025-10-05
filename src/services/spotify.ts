import { supabase } from './supabase';

// Spotify API types
interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  duration_ms: number;
  preview_url?: string;
  popularity: number;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

interface ArtistAnalytics {
  followers: number;
  popularity: number;
  topTracks: SpotifyTrack[];
  monthlyListeners: number; // This would come from Spotify for Artists API
  totalStreams: number; // This would come from Spotify for Artists API
}

interface OAuthToken {
  id: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string;
  created_at: string;
  updated_at: string;
}

class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'playlist-read-private',
    'user-top-read'
  ];
  private useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/auth/spotify/callback`;
  }

  // Generate OAuth URL for user consent
  getAuthUrl(): string {
    if (this.useMockData) {
      return '#mock-spotify-auth';
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state: Math.random().toString(36).substring(2), // CSRF protection
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Handle OAuth callback and exchange code for tokens
  async handleOAuthCallback(code: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Simulating Spotify OAuth callback');
        await this.storeMockTokens();
        return true;
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Spotify OAuth token exchange failed: ${response.status}`);
      }

      const tokens = await response.json();
      await this.storeTokens(tokens);
      return true;
    } catch (error) {
      console.error('Error handling Spotify OAuth callback:', error);
      return false;
    }
  }

  // Store OAuth tokens in database
  private async storeTokens(tokens: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: user.id,
        provider: 'spotify',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope,
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      throw new Error(`Failed to store Spotify tokens: ${error.message}`);
    }
  }

  // Store mock tokens for development
  private async storeMockTokens(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const mockTokens = {
      access_token: 'mock_spotify_token_' + Math.random().toString(36).substring(2),
      refresh_token: 'mock_spotify_refresh_' + Math.random().toString(36).substring(2),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      scope: this.scopes.join(' ')
    };

    const { error } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: user.id,
        provider: 'spotify',
        ...mockTokens,
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      throw new Error(`Failed to store mock Spotify tokens: ${error.message}`);
    }
  }

  // Get stored tokens for current user
  async getStoredTokens(): Promise<OAuthToken | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'spotify')
      .single();

    if (error) {
      console.error('Error fetching stored Spotify tokens:', error);
      return null;
    }

    return data;
  }

  // Check if user has valid Spotify connection
  async isConnected(): Promise<boolean> {
    const tokens = await this.getStoredTokens();
    if (!tokens) {
      return false;
    }

    // Check if token is expired
    if (tokens.expires_at) {
      const expiresAt = new Date(tokens.expires_at);
      const now = new Date();
      if (now >= expiresAt) {
        // Try to refresh token
        return await this.refreshTokens();
      }
    }

    return true;
  }

  // Refresh expired access token
  private async refreshTokens(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens?.refresh_token) {
        return false;
      }

      if (this.useMockData) {
        console.log('🧪 Mock: Simulating Spotify token refresh');
        await this.storeMockTokens();
        return true;
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error(`Spotify token refresh failed: ${response.status}`);
      }

      const newTokens = await response.json();
      await this.storeTokens({
        ...newTokens,
        refresh_token: tokens.refresh_token, // Keep existing refresh token
      });

      return true;
    } catch (error) {
      console.error('Error refreshing Spotify tokens:', error);
      return false;
    }
  }

  // Make authenticated API request to Spotify
  private async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const tokens = await this.getStoredTokens();
    if (!tokens) {
      throw new Error('No Spotify tokens found');
    }

    if (this.useMockData) {
      return this.getMockApiResponse(endpoint);
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token might be expired, try to refresh
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        // Retry with new token
        const newTokens = await this.getStoredTokens();
        const retryResponse = await fetch(`https://api.spotify.com/v1${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newTokens?.access_token}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        return retryResponse.json();
      }
      throw new Error('Spotify authentication failed');
    }

    if (!response.ok) {
      throw new Error(`Spotify API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Get mock API responses for development
  private getMockApiResponse(endpoint: string): any {
    if (endpoint.includes('/search')) {
      return {
        tracks: {
          items: [
            {
              id: 'mock_track_1',
              name: 'Test Song',
              artists: [{ id: 'mock_artist_1', name: 'Test Artist' }],
              album: {
                id: 'mock_album_1',
                name: 'Test Album',
                images: [{ url: 'https://via.placeholder.com/300', width: 300, height: 300 }]
              },
              duration_ms: 210000,
              popularity: 75
            },
            {
              id: 'mock_track_2',
              name: 'Another Song',
              artists: [{ id: 'mock_artist_2', name: 'Another Artist' }],
              album: {
                id: 'mock_album_2',
                name: 'Another Album',
                images: [{ url: 'https://via.placeholder.com/300', width: 300, height: 300 }]
              },
              duration_ms: 195000,
              popularity: 68
            }
          ],
          total: 2
        }
      };
    }

    if (endpoint.includes('/artists/')) {
      return {
        id: 'mock_artist_id',
        name: 'The Demo Band',
        genres: ['indie rock', 'alternative'],
        popularity: 65,
        followers: { total: 12500 },
        images: [{ url: 'https://via.placeholder.com/300', width: 300, height: 300 }]
      };
    }

    if (endpoint.includes('/me/top/tracks')) {
      return {
        items: [
          {
            id: 'mock_top_track_1',
            name: 'Popular Song',
            artists: [{ id: 'mock_artist_1', name: 'The Demo Band' }],
            album: {
              name: 'Hit Album',
              images: [{ url: 'https://via.placeholder.com/300', width: 300, height: 300 }]
            },
            duration_ms: 220000,
            popularity: 85
          }
        ]
      };
    }

    return {};
  }

  // Search for tracks
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const response = await this.makeApiRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
      return response.tracks?.items || [];
    } catch (error) {
      console.error('Error searching Spotify tracks:', error);
      return [];
    }
  }

  // Get artist information by name
  async getArtistByName(artistName: string): Promise<SpotifyArtist | null> {
    try {
      const response = await this.makeApiRequest(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
      return response.artists?.items[0] || null;
    } catch (error) {
      console.error('Error fetching Spotify artist:', error);
      return null;
    }
  }

  // Get artist analytics (for connected artist)
  async getArtistAnalytics(artistName: string): Promise<ArtistAnalytics | null> {
    try {
      if (this.useMockData) {
        return {
          followers: 12500,
          popularity: 65,
          monthlyListeners: 8200,
          totalStreams: 450000,
          topTracks: [
            {
              id: 'mock_top_1',
              name: 'Popular Song',
              artists: [{ id: 'mock_artist_1', name: artistName }],
              album: {
                id: 'mock_album_1',
                name: 'Hit Album',
                images: [{ url: 'https://via.placeholder.com/300', width: 300, height: 300 }]
              },
              duration_ms: 220000,
              popularity: 85,
              preview_url: undefined
            }
          ]
        };
      }

      const artist = await this.getArtistByName(artistName);
      if (!artist) {
        return null;
      }

      // Get top tracks
      const topTracksResponse = await this.makeApiRequest(`/artists/${artist.id}/top-tracks?market=US`);
      
      return {
        followers: artist.followers.total,
        popularity: artist.popularity,
        topTracks: topTracksResponse.tracks || [],
        monthlyListeners: 0, // Would need Spotify for Artists API for real data
        totalStreams: 0, // Would need Spotify for Artists API for real data
      };
    } catch (error) {
      console.error('Error fetching artist analytics:', error);
      return null;
    }
  }

  // Update artist name for organization
  async updateArtistName(orgId: string, artistName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orgs')
        .update({ spotify_artist_name: artistName })
        .eq('id', orgId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating artist name:', error);
      return false;
    }
  }

  // Disconnect Spotify (remove tokens)
  async disconnect(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', 'spotify');

    if (error) {
      throw new Error(`Failed to disconnect Spotify: ${error.message}`);
    }
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;