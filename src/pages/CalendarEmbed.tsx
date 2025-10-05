import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { googleCalendarService } from '@/services/googleCalendar';
import { useNavigate } from 'react-router-dom';

export default function CalendarEmbed() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkConnectionAndLoadCalendar();
  }, []);

  const checkConnectionAndLoadCalendar = async () => {
    try {
      const connected = await googleCalendarService.isConnected();
      setIsConnected(connected);

      if (connected) {
        const url = googleCalendarService.getEmbedUrl('primary');
        setEmbedUrl(url);
      }
    } catch (error) {
      console.error('Error loading Google Calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOpenInGoogle = () => {
    window.open('https://calendar.google.com', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={handleGoBack}
              className={cn(
                'flex items-center space-x-2 text-muted-foreground hover:text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={handleGoBack}
              className={cn(
                'flex items-center space-x-2 text-muted-foreground hover:text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Google Calendar Not Connected
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To view your Google Calendar, you need to connect your account first.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className={cn(
                'bg-primary text-primary-foreground px-6 py-3 rounded-md',
                'font-medium hover:bg-primary/90 focus:outline-none focus:ring-2',
                'focus:ring-primary focus:ring-offset-2'
              )}
            >
              Go to Profile & Connect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className={cn(
                'flex items-center space-x-2 text-muted-foreground hover:text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Google Calendar</h1>
              </div>

              <button
                onClick={handleOpenInGoogle}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground',
                  'rounded-md font-medium hover:bg-primary/90 focus:outline-none',
                  'focus:ring-2 focus:ring-primary focus:ring-offset-2'
                )}
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in Google</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {embedUrl ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {import.meta.env.VITE_USE_MOCK_DATA === 'true' ? (
              // Mock calendar view for development
              <div className="p-8 text-center">
                <div className="bg-muted/30 rounded-lg p-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Mock Google Calendar
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    This is a mock calendar view. In production, your Google Calendar would be embedded here.
                  </p>
                  
                  {/* Mock calendar events */}
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-left">
                      <div className="font-medium text-foreground">Friday Night Live</div>
                      <div className="text-sm text-muted-foreground">Dec 15, 2024 • 8:00 PM</div>
                      <div className="text-sm text-muted-foreground">The Bluebird Cafe, Nashville</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-left">
                      <div className="font-medium text-foreground">Band Practice</div>
                      <div className="text-sm text-muted-foreground">Dec 18, 2024 • 7:00 PM</div>
                      <div className="text-sm text-muted-foreground">Studio Downtown</div>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-left">
                      <div className="font-medium text-foreground">Saturday Night Show</div>
                      <div className="text-sm text-muted-foreground">Dec 21, 2024 • 7:30 PM</div>
                      <div className="text-sm text-muted-foreground">Ryman Auditorium, Nashville</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-6">
                    Shows synced from ChordLine are highlighted in blue
                  </p>
                </div>
              </div>
            ) : (
              // Real embedded Google Calendar
              <iframe
                src={embedUrl}
                style={{ border: 0 }}
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="no"
                title="Google Calendar"
                className="w-full"
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Unable to Load Calendar
            </h2>
            <p className="text-muted-foreground mb-6">
              There was an issue loading your Google Calendar. Please try reconnecting.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className={cn(
                'bg-primary text-primary-foreground px-6 py-3 rounded-md',
                'font-medium hover:bg-primary/90 focus:outline-none focus:ring-2',
                'focus:ring-primary focus:ring-offset-2'
              )}
            >
              Go to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}