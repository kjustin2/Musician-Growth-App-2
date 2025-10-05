import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { googleCalendarService } from '@/services/googleCalendar';
import { useNavigate } from 'react-router-dom';

interface GoogleCalendarIntegrationProps {
  shows?: Array<{
    id: string;
    title: string;
    date: string;
    time?: string;
    venue?: {
      name: string;
      city: string;
    };
  }>;
  onConnectionChange?: (connected: boolean) => void;
}

export default function GoogleCalendarIntegration({
  shows = [],
  onConnectionChange
}: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const connected = await googleCalendarService.isConnected();
      setIsConnected(connected);
      onConnectionChange?.(connected);
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      setError('Failed to check connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // In mock mode, simulate the OAuth flow
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('🧪 Mock: Simulating Google Calendar OAuth flow');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        
        // Mock the OAuth callback
        const success = await googleCalendarService.handleOAuthCallback('mock_auth_code');
        if (success) {
          setIsConnected(true);
          onConnectionChange?.(true);
        } else {
          throw new Error('Mock OAuth flow failed');
        }
      } else {
        // Redirect to Google OAuth in production
        const authUrl = googleCalendarService.getAuthUrl();
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setError('Failed to connect to Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(null);
      await googleCalendarService.disconnect();
      setIsConnected(false);
      onConnectionChange?.(false);
      setLastSyncResult(null);
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Failed to disconnect from Google Calendar');
    }
  };

  const handleSyncShows = async () => {
    if (!shows.length) {
      setError('No shows to sync');
      return;
    }

    try {
      setIsSyncing(true);
      setError(null);
      
      const result = await googleCalendarService.syncShows(shows);
      setLastSyncResult(result);
      
      if (result.failed > 0) {
        setError(`${result.failed} show(s) failed to sync`);
      }
    } catch (error) {
      console.error('Error syncing shows:', error);
      setError('Failed to sync shows to Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewCalendar = () => {
    // Open embedded calendar view
    navigate('/calendar/google');
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Checking connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-2 rounded-lg',
            isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          )}>
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Google Calendar</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Connected and ready to sync' : 'Connect to sync your shows'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected && (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              Connected
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Sync result display */}
      {lastSyncResult && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Last sync: {lastSyncResult.success} successful, {lastSyncResult.failed} failed
          </p>
        </div>
      )}

      {/* Connection actions */}
      <div className="space-y-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={cn(
              'w-full flex items-center justify-center px-4 py-2 rounded-md',
              'bg-primary text-primary-foreground font-medium',
              'hover:bg-primary/90 focus:outline-none focus:ring-2',
              'focus:ring-primary focus:ring-offset-2 disabled:opacity-50'
            )}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Connect Google Calendar
              </>
            )}
          </button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleSyncShows}
              disabled={isSyncing || shows.length === 0}
              className={cn(
                'flex items-center justify-center px-4 py-2 rounded-md',
                'bg-blue-600 text-white font-medium',
                'hover:bg-blue-700 focus:outline-none focus:ring-2',
                'focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
              )}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Shows ({shows.length})
                </>
              )}
            </button>
            
            <button
              onClick={handleViewCalendar}
              className={cn(
                'flex items-center justify-center px-4 py-2 rounded-md',
                'bg-card border border-border font-medium',
                'hover:bg-accent focus:outline-none focus:ring-2',
                'focus:ring-primary focus:ring-offset-2'
              )}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Calendar
            </button>
          </div>
        )}
        
        {isConnected && (
          <div className="pt-3 border-t border-border">
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-600 hover:text-red-700 focus:outline-none"
            >
              Disconnect Google Calendar
            </button>
          </div>
        )}
      </div>

      {/* Features info */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Features:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Sync shows to your Google Calendar</li>
          <li>• Automatic event creation with venue details</li>
          <li>• View your shows alongside other calendar events</li>
          <li>• Real-time synchronization</li>
        </ul>
      </div>
    </div>
  );
}