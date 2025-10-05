// Service configuration and API abstraction layer
// Handles switching between local mock services and production APIs

interface ApiEndpoints {
  supabase: {
    url: string;
    anonKey: string;
  };
  openweather: {
    baseUrl: string;
    apiKey: string;
  };
  spotify: {
    baseUrl: string;
    clientId?: string;
    // clientSecret removed for security - use server-side OAuth
  };
  googleCalendar: {
    baseUrl: string;
    apiKey: string;
    clientId?: string;
  };
  openrouter: {
    baseUrl: string;
    apiKey: string;
  };
  mapbox: {
    baseUrl: string;
    token: string;
  };
}

export class ServiceConfig {
  private static instance: ServiceConfig;
  private readonly mode: string;
  private readonly endpoints: ApiEndpoints;

  private constructor() {
    this.mode = import.meta.env.VITE_APP_MODE || 'production';
    this.endpoints = this.initializeEndpoints();
    
    // Only log in development/local modes for security
    if (this.mode === 'local' || import.meta.env.DEV) {
      console.log(`🔧 ServiceConfig initialized in ${this.mode} mode`);
      
      if (this.mode === 'local') {
        console.log('📍 Local API endpoints:', {
          supabase: this.endpoints.supabase.url,
          openweather: this.endpoints.openweather.baseUrl,
          spotify: this.endpoints.spotify.baseUrl,
          googleCalendar: this.endpoints.googleCalendar.baseUrl,
          openrouter: this.endpoints.openrouter.baseUrl,
          mapbox: this.endpoints.mapbox.baseUrl
        });
      }
    }
  }

  public static getInstance(): ServiceConfig {
    if (!ServiceConfig.instance) {
      ServiceConfig.instance = new ServiceConfig();
    }
    return ServiceConfig.instance;
  }

  private initializeEndpoints(): ApiEndpoints {
    if (this.mode === 'local') {
      return {
        supabase: {
          url: import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
          anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        },
        openweather: {
          baseUrl: import.meta.env.VITE_OPENWEATHER_API_URL || 'http://localhost:8081',
          apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || 'mock_openweather_key_local'
        },
        spotify: {
          baseUrl: import.meta.env.VITE_SPOTIFY_API_URL || 'http://localhost:8082',
          clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          // Note: Client secrets should NEVER be exposed in frontend code
          // OAuth flows must be implemented server-side or use PKCE for public clients
        },
        googleCalendar: {
          baseUrl: import.meta.env.VITE_GOOGLE_CALENDAR_API_URL || 'http://localhost:8083',
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'mock_google_maps_key_local',
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
        },
        openrouter: {
          baseUrl: import.meta.env.VITE_OPENROUTER_API_URL || 'http://localhost:8084',
          apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || 'mock_openrouter_key_local'
        },
        mapbox: {
          baseUrl: import.meta.env.VITE_MAPBOX_API_URL || 'http://localhost:8085',
          token: import.meta.env.VITE_MAPBOX_TOKEN || 'mock_mapbox_token_local'
        }
      };
    } else {
      // Production endpoints
      return {
        supabase: {
          url: import.meta.env.VITE_SUPABASE_URL || '',
          anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        openweather: {
          baseUrl: 'https://api.openweathermap.org',
          apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || ''
        },
        spotify: {
          baseUrl: 'https://api.spotify.com',
          clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          // Client secret moved to server-side implementation
        },
        googleCalendar: {
          baseUrl: 'https://www.googleapis.com',
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
        },
        openrouter: {
          baseUrl: 'https://openrouter.ai',
          apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || ''
        },
        mapbox: {
          baseUrl: 'https://api.mapbox.com',
          token: import.meta.env.VITE_MAPBOX_TOKEN || ''
        }
      };
    }
  }

  // Getters for service configurations
  public get isLocalMode(): boolean {
    return this.mode === 'local';
  }

  public get supabaseConfig() {
    return this.endpoints.supabase;
  }

  public get openweatherConfig() {
    return this.endpoints.openweather;
  }

  public get spotifyConfig() {
    return this.endpoints.spotify;
  }

  public get googleCalendarConfig() {
    return this.endpoints.googleCalendar;
  }

  public get openrouterConfig() {
    return this.endpoints.openrouter;
  }

  public get mapboxConfig() {
    return this.endpoints.mapbox;
  }

  // Helper methods for creating service instances
  public createAuthenticatedFetch(service: keyof ApiEndpoints) {
    return async (url: string, options: RequestInit = {}): Promise<Response> => {
      const config = this.endpoints[service];
      const baseUrl = 'baseUrl' in config ? config.baseUrl : '';
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      
      // Add service-specific headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      // Add authentication based on service
      switch (service) {
        case 'openweather':
          // OpenWeatherMap uses API key in URL params
          const weatherUrl = new URL(fullUrl);
          weatherUrl.searchParams.set('appid', this.endpoints.openweather.apiKey);
          return fetch(weatherUrl.toString(), { ...options, headers });

        case 'spotify':
          // Spotify uses Bearer token (would be obtained via OAuth)
          const spotifyToken = this.getSpotifyToken();
          if (spotifyToken) {
            headers['Authorization'] = `Bearer ${spotifyToken}`;
          }
          break;

        case 'googleCalendar':
          // Google Calendar uses Bearer token (OAuth)
          const googleToken = this.getGoogleToken();
          if (googleToken) {
            headers['Authorization'] = `Bearer ${googleToken}`;
          }
          break;

        case 'openrouter':
          // OpenRouter uses API key in Authorization header
          headers['Authorization'] = `Bearer ${this.endpoints.openrouter.apiKey}`;
          break;

        case 'mapbox':
          // Mapbox uses token in URL params
          const mapboxUrl = new URL(fullUrl);
          mapboxUrl.searchParams.set('access_token', this.endpoints.mapbox.token);
          return fetch(mapboxUrl.toString(), { ...options, headers });
      }

      return fetch(fullUrl, { ...options, headers });
    };
  }

  // Token management (would integrate with your auth system)
  private getSpotifyToken(): string | null {
    if (this.mode === 'local') {
      return 'mock_spotify_token_' + Date.now();
    }
    // In production, retrieve from stored OAuth tokens
    return localStorage.getItem('spotify_access_token');
  }

  private getGoogleToken(): string | null {
    if (this.mode === 'local') {
      return 'mock_google_token_' + Date.now();
    }
    // In production, retrieve from stored OAuth tokens
    return localStorage.getItem('google_access_token');
  }

  // Health check for all services
  public async healthCheck(): Promise<Record<string, { status: 'healthy' | 'unhealthy' | 'unknown', latency?: number }>> {
    const services = ['openweather', 'spotify', 'googleCalendar', 'openrouter', 'mapbox'] as const;
    const results: Record<string, { status: 'healthy' | 'unhealthy' | 'unknown', latency?: number }> = {};

    const checkPromises = services.map(async (service) => {
      const start = Date.now();
      try {
        let healthUrl: string;
        
        switch (service) {
          case 'openweather':
            healthUrl = `${this.endpoints.openweather.baseUrl}/health`;
            break;
          case 'spotify':
            healthUrl = `${this.endpoints.spotify.baseUrl}/health`;
            break;
          case 'googleCalendar':
            healthUrl = `${this.endpoints.googleCalendar.baseUrl}/health`;
            break;
          case 'openrouter':
            healthUrl = `${this.endpoints.openrouter.baseUrl}/health`;
            break;
          case 'mapbox':
            healthUrl = `${this.endpoints.mapbox.baseUrl}/health`;
            break;
        }

        const response = await fetch(healthUrl, { 
          method: 'GET',
          timeout: 5000 // 5 second timeout
        } as RequestInit);

        const latency = Date.now() - start;
        results[service] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          latency
        };
      } catch (error) {
        results[service] = {
          status: 'unhealthy',
          latency: Date.now() - start
        };
      }
    });

    await Promise.all(checkPromises);
    return results;
  }

  // Get service URLs for display
  public getServiceUrls() {
    return {
      supabase: this.endpoints.supabase.url,
      openweather: this.endpoints.openweather.baseUrl,
      spotify: this.endpoints.spotify.baseUrl,
      googleCalendar: this.endpoints.googleCalendar.baseUrl,
      openrouter: this.endpoints.openrouter.baseUrl,
      mapbox: this.endpoints.mapbox.baseUrl
    };
  }
}

// Export singleton instance
export const serviceConfig = ServiceConfig.getInstance();

// Typed service clients
export const apiClients = {
  openweather: serviceConfig.createAuthenticatedFetch('openweather'),
  spotify: serviceConfig.createAuthenticatedFetch('spotify'),
  googleCalendar: serviceConfig.createAuthenticatedFetch('googleCalendar'),
  openrouter: serviceConfig.createAuthenticatedFetch('openrouter'),
  mapbox: serviceConfig.createAuthenticatedFetch('mapbox')
};

export default serviceConfig;