import { useState } from 'react';
import { Settings, Cloud, Calendar, Music, Share2, MapPin, Download, ExternalLink, Unplug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'calendar' | 'social' | 'music' | 'location' | 'weather' | 'analytics';
  status: 'connected' | 'available' | 'coming_soon';
  features: string[];
}

const mockIntegrations: Integration[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync your shows with Google Calendar for better scheduling',
    icon: Calendar,
    category: 'calendar',
    status: 'available',
    features: ['Auto-sync show dates', 'Calendar reminders', 'Venue information in events']
  },
  {
    id: 'spotify',
    name: 'Spotify for Artists',
    description: 'Track streaming stats and manage your artist profile',
    icon: Music,
    category: 'music',
    status: 'coming_soon',
    features: ['Streaming analytics', 'Playlist management', 'Fan demographics']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Share show updates and earnings milestones',
    icon: Share2,
    category: 'social',
    status: 'coming_soon',
    features: ['Auto-post show announcements', 'Story templates', 'Hashtag suggestions']
  },
  {
    id: 'google_places',
    name: 'Google Places',
    description: 'Find and verify venue information automatically',
    icon: MapPin,
    category: 'location',
    status: 'available',
    features: ['Venue search', 'Address validation', 'Contact information']
  },
  {
    id: 'openweather',
    name: 'OpenWeatherMap',
    description: 'Get weather forecasts for your show dates',
    icon: Cloud,
    category: 'weather',
    status: 'available',
    features: ['7-day forecasts', 'Weather alerts', 'Indoor/outdoor recommendations']
  },
  {
    id: 'export_tools',
    name: 'Export Tools',
    description: 'Export your data to various formats for tax reporting',
    icon: Download,
    category: 'analytics',
    status: 'available',
    features: ['CSV exports', 'PDF reports', 'Tax-ready formatting']
  }
];

const getCategoryIcon = (category: Integration['category']) => {
  switch (category) {
    case 'calendar': return Calendar;
    case 'social': return Share2;
    case 'music': return Music;
    case 'location': return MapPin;
    case 'weather': return Cloud;
    case 'analytics': return Download;
    default: return Settings;
  }
};

const getStatusColor = (status: Integration['status']) => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'available':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'coming_soon':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Integrations() {
  const { currentOrg } = useOrg();
  const [selectedCategory, setSelectedCategory] = useState<'all' | Integration['category']>('all');
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

  const categories = ['all', 'calendar', 'social', 'music', 'location', 'weather', 'analytics'] as const;
  
  const filteredIntegrations = mockIntegrations.filter(integration => 
    selectedCategory === 'all' || integration.category === selectedCategory
  );

  const handleConnect = (integrationId: string) => {
    if (connectedIntegrations.includes(integrationId)) {
      setConnectedIntegrations(prev => prev.filter(id => id !== integrationId));
    } else {
      setConnectedIntegrations(prev => [...prev, integrationId]);
    }
  };

  if (!currentOrg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">Create a band first</p>
          <p className="text-sm text-muted-foreground">You need to create a band to manage integrations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect {currentOrg.name} with external services
          </p>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {category !== 'all' && (
                  (() => {
                    const Icon = getCategoryIcon(category);
                    return <Icon className="h-4 w-4" />;
                  })()
                )}
                <span className="capitalize">{category === 'all' ? 'All' : category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations List */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredIntegrations.map((integration) => {
            const isConnected = connectedIntegrations.includes(integration.id);
            const effectiveStatus = isConnected ? 'connected' : integration.status;
            
            return (
              <div key={integration.id} className="bg-card border border-border rounded-lg p-4">
                {/* Integration Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent p-2 rounded-lg">
                      <integration.icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{integration.name}</h3>
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-md font-medium capitalize",
                        getStatusColor(effectiveStatus)
                      )}>
                        {effectiveStatus === 'connected' ? 'Connected' : 
                         effectiveStatus === 'available' ? 'Available' : 'Coming Soon'}
                      </span>
                    </div>
                  </div>
                  
                  {integration.status === 'available' && (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className={cn(
                        "flex items-center space-x-1 px-3 py-1 text-sm rounded-md transition-colors",
                        isConnected
                          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {isConnected ? (
                        <>
                          <Unplug className="h-4 w-4" />
                          <span>Disconnect</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Integration Description */}
                <p className="text-sm text-muted-foreground mb-3">
                  {integration.description}
                </p>

                {/* Features List */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {integration.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Coming Soon Notice */}
                {integration.status === 'coming_soon' && (
                  <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                    <p className="text-orange-800 dark:text-orange-100 text-sm">
                      This integration is coming soon! We'll notify you when it's ready.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-16">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              No integrations found
            </p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different category or check back later for new integrations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}