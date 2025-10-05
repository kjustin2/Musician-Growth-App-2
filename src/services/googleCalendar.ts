import { supabase } from './supabase';

// Google Calendar API types
interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

interface CalendarListEntry {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole: string;
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

class GoogleCalendarService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];
  private useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  constructor() {
    // In production, these would come from environment variables
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;
  }

  // Generate OAuth URL for user consent
  getAuthUrl(): string {
    if (this.useMockData) {
      // Return mock URL for development
      return '#mock-google-auth';
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Handle OAuth callback and exchange code for tokens
  async handleOAuthCallback(code: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Simulating Google OAuth callback');
        await this.storeMockTokens();
        return true;
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`OAuth token exchange failed: ${response.status}`);
      }

      const tokens = await response.json();
      await this.storeTokens(tokens);
      return true;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
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
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope,
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      throw new Error(`Failed to store tokens: ${error.message}`);
    }
  }

  // Store mock tokens for development
  private async storeMockTokens(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const mockTokens = {
      access_token: 'mock_access_token_' + Math.random().toString(36).substring(2),
      refresh_token: 'mock_refresh_token_' + Math.random().toString(36).substring(2),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
      scope: this.scopes.join(' ')
    };

    const { error } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: user.id,
        provider: 'google',
        ...mockTokens,
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      throw new Error(`Failed to store mock tokens: ${error.message}`);
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
      .eq('provider', 'google')
      .single();

    if (error) {
      console.error('Error fetching stored tokens:', error);
      return null;
    }

    return data;
  }

  // Check if user has valid Google Calendar connection
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
        console.log('🧪 Mock: Simulating token refresh');
        await this.storeMockTokens();
        return true;
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const newTokens = await response.json();
      await this.storeTokens({
        ...newTokens,
        refresh_token: tokens.refresh_token, // Keep existing refresh token
      });

      return true;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return false;
    }
  }

  // Make authenticated API request to Google Calendar
  private async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const tokens = await this.getStoredTokens();
    if (!tokens) {
      throw new Error('No Google Calendar tokens found');
    }

    if (this.useMockData) {
      return this.getMockApiResponse(endpoint);
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3${endpoint}`, {
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
        const retryResponse = await fetch(`https://www.googleapis.com/calendar/v3${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newTokens?.access_token}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        return retryResponse.json();
      }
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`Calendar API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Get mock API responses for development
  private getMockApiResponse(endpoint: string): any {
    if (endpoint === '/calendars') {
      return {
        items: [
          {
            id: 'primary',
            summary: 'Primary Calendar',
            primary: true,
            accessRole: 'owner'
          },
          {
            id: 'shows@example.com',
            summary: 'Band Shows',
            primary: false,
            accessRole: 'owner'
          }
        ]
      };
    }

    if (endpoint.includes('/events')) {
      return {
        items: [
          {
            id: 'mock_event_1',
            summary: 'Test Concert',
            start: { dateTime: '2024-12-20T20:00:00-06:00' },
            end: { dateTime: '2024-12-20T23:00:00-06:00' },
            location: 'Nashville, TN',
            status: 'confirmed'
          }
        ]
      };
    }

    return {};
  }

  // Get user's calendars
  async getCalendars(): Promise<CalendarListEntry[]> {
    try {
      const response = await this.makeApiRequest('/users/me/calendarList');
      return response.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      return [];
    }
  }

  // Create a calendar event from a show
  async createEventFromShow(show: {
    title: string;
    date: string;
    time?: string;
    venue?: {
      name: string;
      city: string;
    };
  }, calendarId: string = 'primary'): Promise<string | null> {
    try {
      const startDateTime = new Date(`${show.date}T${show.time || '20:00'}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (3 * 60 * 60 * 1000)); // 3 hours later

      const event: CalendarEvent = {
        summary: show.title,
        description: `Show at ${show.venue?.name || 'Venue TBD'}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: show.venue ? `${show.venue.name}, ${show.venue.city}` : undefined,
        status: 'confirmed',
      };

      if (this.useMockData) {
        console.log('🧪 Mock: Created calendar event:', event);
        return `mock_event_${Date.now()}`;
      }

      const response = await this.makeApiRequest(`/calendars/${calendarId}/events`, {
        method: 'POST',
        body: JSON.stringify(event),
      });

      return response.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  // Sync multiple shows to Google Calendar
  async syncShows(shows: Array<{
    id: string;
    title: string;
    date: string;
    time?: string;
    venue?: {
      name: string;
      city: string;
    };
  }>, calendarId: string = 'primary'): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const show of shows) {
      try {
        const eventId = await this.createEventFromShow(show, calendarId);
        if (eventId) {
          success++;
        } else {
          failed++;
        }
        
        // Add small delay to avoid rate limiting
        if (!this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Error syncing show ${show.id}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  // Disconnect Google Calendar (remove tokens)
  async disconnect(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', 'google');

    if (error) {
      throw new Error(`Failed to disconnect: ${error.message}`);
    }
  }

  // Get embedded calendar URL
  getEmbedUrl(calendarId: string = 'primary'): string {
    if (this.useMockData) {
      return '#mock-embedded-calendar';
    }
    
    const params = new URLSearchParams({
      src: calendarId,
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      showTitle: '0',
      showPrint: '0',
      showTabs: '0',
      showCalendars: '0',
      mode: 'AGENDA',
      height: '400',
    });

    return `https://calendar.google.com/calendar/embed?${params.toString()}`;
  }
}

export const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;