import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, DollarSign, Edit, Trash2, Loader2, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';
import { useLogger } from '@/utils/logger';
import { supabase } from '@/services/supabase';
import weatherService, { type ProcessedWeatherData } from '@/services/weather';
import AddShowModal from '@/components/AddShowModal';

// Show interface for our UI
interface UIShow {
  id: string;
  band_id: string;
  date: string;
  time?: string;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  title?: string;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    state?: string | null;
    country: string;
  };
  earnings?: {
    id: string;
    amount: number;
    currency: string;
  }[];
  weather?: ProcessedWeatherData;
  created_at: string;
  updated_at: string;
}

const getStatusColor = (status: UIShow['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'planned':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Shows() {
  const { currentOrg } = useOrg();
  const logger = useLogger('Shows');
  const [shows, setShows] = useState<UIShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | UIShow['status']>('all');
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState<Set<string>>(new Set());

  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Log component initialization once in useEffect instead of during render

  // Mock shows data
  const mockShows: UIShow[] = [
    {
      id: '1',
      title: 'Friday Night Live',
      date: '2024-12-15',
      time: '20:00',
      status: 'confirmed',
      notes: '150 tickets sold',
      venue: {
        id: 'venue-1',
        name: 'The Bluebird Cafe',
        address: '4104 Hillsboro Pike',
        city: 'Nashville',
        state: 'TN',
        country: 'USA'
      },
      earnings: [{
        id: 'earning-1',
        amount: 3750,
        currency: 'USD'
      }]
    },
    {
      id: '2',
      title: 'Saturday Night Show',
      date: '2024-12-20',
      time: '19:30',
      status: 'planned',
      notes: 'Opening for headliner',
      venue: {
        id: 'venue-2',
        name: 'Ryman Auditorium',
        address: '116 Rep. John Lewis Way N',
        city: 'Nashville',
        state: 'TN',
        country: 'USA'
      }
    },
    {
      id: '3',
      title: "New Year's Eve Celebration",
      date: '2024-12-31',
      time: '21:00',
      status: 'planned',
      notes: 'Special holiday show',
      venue: {
        id: 'venue-3',
        name: 'Grand Ole Opry',
        address: '2804 Opryland Dr',
        city: 'Nashville',
        state: 'TN',
        country: 'USA'
      }
    }
  ];

  // Fetch shows data (Remove logger from dependencies)
  const fetchShows = React.useCallback(async () => {
    if (!currentOrg) return;
    
    logger.info('Starting to fetch shows', { orgId: currentOrg.id });
    const endTimer = logger.startTimer('fetchShows');
    setLoading(true);
    setError('');
    
    try {
      if (useMockData) {
        logger.debug('Using mock data for shows');
        await new Promise(resolve => setTimeout(resolve, 800));
        setShows(mockShows);
        logger.info('Mock shows loaded successfully', { count: mockShows.length });
      } else {
        logger.debug('Fetching shows from database');
        const { data, error: fetchError } = await supabase
          .from('shows')
          .select(`
            id,
            title,
            date,
            time,
            status,
            notes,
            venue:venues(
              id,
              name,
              address,
              city,
              state,
              country
            ),
            earnings(
              id,
              amount,
              currency
            )
          `)
          .eq('org_id', currentOrg.id)
          .order('date', { ascending: true });

        if (fetchError) throw fetchError;
        
        const formattedShows = (data as any[] || []).map((show: any) => ({
          ...show,
          band_id: currentOrg.id,
          created_at: show.created_at || new Date().toISOString(),
          updated_at: show.updated_at || new Date().toISOString()
        }));
        
        setShows(formattedShows);
        logger.info('Database shows loaded successfully', { count: formattedShows.length });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load shows';
      logger.error('Error fetching shows', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      endTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg?.id, useMockData]);

  // Load shows when component mounts or org changes and log initialization
  React.useEffect(() => {
    logger.info('Shows component initialized', { orgId: currentOrg?.id });
    fetchShows();
  }, [fetchShows]);

  // Weather loading functionality (Remove logger from dependencies)
  const loadWeatherForShow = React.useCallback(async (show: UIShow) => {
    if (show.weather || loadingWeather.has(show.id)) return;
    
    const showDate = new Date(show.date);
    const today = new Date();
    const isUpcoming = showDate >= today && ['planned', 'confirmed'].includes(show.status);
    
    if (!isUpcoming) return;
    
    logger.debug('Loading weather for show', { showId: show.id, venue: show.venue.name });
    setLoadingWeather(prev => new Set([...prev, show.id]));
    
    try {
      const weather = await weatherService.getWeatherForShow(show.venue.city, show.date);
      if (weather) {
        logger.info('Weather loaded successfully', {
          showId: show.id,
          temperature: weather.temperature,
          description: weather.description
        });
        
        // Update show with weather data
        setShows(prevShows => 
          prevShows.map(s => 
            s.id === show.id ? { ...s, weather } : s
          )
        );
      }
    } catch (error) {
      logger.error('Failed to load weather for show', { showId: show.id, error });
    } finally {
      setLoadingWeather(prev => {
        const newSet = new Set(prev);
        newSet.delete(show.id);
        return newSet;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingWeather]);

  // Load weather for upcoming shows when data changes
  React.useEffect(() => {
    if (shows.length > 0) {
      logger.debug('Loading weather for shows', { count: shows.length });
      shows.forEach(show => {
        loadWeatherForShow(show);
      });
    }
  }, [shows, loadWeatherForShow]);

  // Filter and sort shows (Remove logger from dependencies)
  const sortedShows = React.useMemo(() => {
    logger.debug('Filtering and sorting shows', { filterStatus, totalShows: shows.length });
    
    const filtered = shows.filter(show => 
      filterStatus === 'all' || show.status === filterStatus
    );
    
    const sorted = [...filtered].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    logger.debug('Shows filtered and sorted', { filteredCount: sorted.length });
    return sorted;
  }, [shows, filterStatus]);

  if (!currentOrg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">Create a band first</p>
          <p className="text-sm text-muted-foreground">You need to create a band to manage shows</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Shows</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentOrg.name} performances
              </p>
            </div>
            <button
              onClick={() => setIsAddShowOpen(true)}
              className={cn(
                "bg-primary text-primary-foreground p-2 rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-4 py-2">
            {(['all', 'planned', 'confirmed', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-3 py-1 text-sm rounded-md capitalize transition-colors",
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {status === 'all' ? 'All Shows' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shows List */}
      <div className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400 mb-2">
              {error || 'Failed to load shows'}
            </p>
            <button
              onClick={() => {
                logger.userAction('retry_fetch_shows');
                fetchShows();
              }}
              className={cn(
                "px-4 py-2 bg-primary text-primary-foreground rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
            >
              Try Again
            </button>
          </div>
        ) : sortedShows.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              {filterStatus === 'all' ? 'No shows yet' : `No ${filterStatus} shows`}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first show to get started!
            </p>
            <button
              onClick={() => setIsAddShowOpen(true)}
              className={cn(
                "bg-primary text-primary-foreground px-4 py-2 rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
            >
              Add Your First Show
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedShows.map((show) => (
              <div key={show.id} className="bg-card border border-border rounded-lg p-4">
                {/* Show Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {show.title || `Show at ${show.venue.name}`}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-md font-medium capitalize",
                        getStatusColor(show.status)
                      )}>
                        {show.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-accent rounded-md transition-colors">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-accent rounded-md transition-colors">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Show Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {show.venue.name}, {show.venue.city}
                      {show.venue.state && `, ${show.venue.state}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(show.date).toLocaleDateString()}</span>
                    </div>
                    {show.time && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{show.time}</span>
                      </div>
                    )}
                  </div>

                  {show.earnings && show.earnings.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-800 dark:text-green-100" />
                        <p className="text-green-800 dark:text-green-100 font-medium">
                          Earned: ${show.earnings[0].amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Weather Information */}
                  {(show.weather || loadingWeather.has(show.id)) && ['planned', 'confirmed'].includes(show.status) && (
                    <div className={cn(
                      "mt-3 p-2 rounded-md",
                      show.weather?.isOutdoorFriendly 
                        ? "bg-blue-50 dark:bg-blue-900/20" 
                        : "bg-yellow-50 dark:bg-yellow-900/20"
                    )}>
                      {loadingWeather.has(show.id) ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          <p className="text-blue-800 dark:text-blue-100 text-sm">
                            Loading weather forecast...
                          </p>
                        </div>
                      ) : show.weather && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Cloud className={cn(
                              "h-4 w-4",
                              show.weather.isOutdoorFriendly 
                                ? "text-blue-600 dark:text-blue-400" 
                                : "text-yellow-600 dark:text-yellow-400"
                            )} />
                            <p className={cn(
                              "font-medium text-sm",
                              show.weather.isOutdoorFriendly 
                                ? "text-blue-800 dark:text-blue-100" 
                                : "text-yellow-800 dark:text-yellow-100"
                            )}>
                              {show.weather.temperature}°F - {show.weather.description}
                            </p>
                          </div>
                          <p className={cn(
                            "text-xs",
                            show.weather.isOutdoorFriendly 
                              ? "text-blue-700 dark:text-blue-200" 
                              : "text-yellow-700 dark:text-yellow-200"
                          )}>
                            {weatherService.getOutdoorRecommendation(show.weather)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Show Modal */}
      {currentOrg && (
        <AddShowModal
          isOpen={isAddShowOpen}
          onClose={() => {
            logger.userAction('close_add_show_modal');
            setIsAddShowOpen(false);
          }}
          orgId={currentOrg.id}
          onShowAdded={() => {
            logger.userAction('show_added_successfully');
            fetchShows();
          }}
        />
      )}
    </div>
  );
}
