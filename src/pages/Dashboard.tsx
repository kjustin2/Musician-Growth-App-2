import { useState, useEffect } from 'react';
import { Plus, Calendar, MessageCircle, CloudSun, Music2, ChevronDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';
import { supabase } from '@/services/supabase';
import { weatherService } from '@/services/weather';
import CreateOrgModal from '@/components/CreateOrgModal';
import AddShowModal from '@/components/AddShowModal';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import EventDetailsModal from '@/components/calendar/EventDetailsModal';
import { useNavigate } from 'react-router-dom';

// Types
interface Show {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue?: {
    name: string;
    city: string;
  };
  earnings?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    show: Show;
    weather?: any;
    earnings?: number;
  };
}

export default function Dashboard() {
  const { currentOrg, userOrgs, loading, switchOrg } = useOrg();
  const navigate = useNavigate();
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  
  // Calendar-specific state
  const [shows, setShows] = useState<Show[]>([]);
  const [weather, setWeather] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [stats, setStats] = useState({ totalShows: 0, totalEarnings: 0 });

  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Fetch calendar data (shows + weather)
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!currentOrg) return;
      
      setIsLoadingData(true);
      try {
        if (useMockData) {
          console.log('🧪 Mock: Loading calendar data for', currentOrg.name);
          await new Promise(resolve => setTimeout(resolve, 600)); // Simulate loading
          
          // Mock shows data
          const mockShows = [
            {
              id: 'show-1',
              title: 'Friday Night Live',
              date: '2024-12-15',
              time: '20:00',
              venue: { name: 'The Bluebird Cafe', city: 'Nashville' },
              earnings: 3750
            },
            {
              id: 'show-2',
              title: 'Saturday Night Show',
              date: '2024-12-21',
              time: '19:30',
              venue: { name: 'Ryman Auditorium', city: 'Nashville' },
              earnings: 5500
            },
            {
              id: 'show-3',
              title: 'New Year\'s Eve Celebration',
              date: '2024-12-31',
              time: '21:00',
              venue: { name: 'Music City Hall', city: 'Nashville' },
              earnings: 8500
            },
            {
              id: 'show-4',
              title: 'Winter Concert',
              date: '2025-01-15',
              time: '18:00',
              venue: { name: 'Downtown Venue', city: 'Nashville' },
              earnings: 4200
            }
          ];
          
          setShows(mockShows);
          
          // Fetch weather for shows
          const weatherData = await weatherService.getWeatherForCalendar(mockShows);
          setWeather(weatherData);
          
          // Calculate stats
          const totalEarnings = mockShows.reduce((sum, show) => sum + (show.earnings || 0), 0);
          setStats({
            totalShows: mockShows.length,
            totalEarnings
          });
          
          setIsLoadingData(false);
          return;
        }

        // Fetch real shows data
        const { data: showsData, error: showsError } = await supabase
          .from('shows')
          .select('*, venue:venues(*), earnings(*)')
          .eq('org_id', currentOrg.id)
          .order('date', { ascending: true });

        if (showsError) {
          console.error('Error fetching shows:', showsError);
          setIsLoadingData(false);
          return;
        }

        // Process shows data
        const processedShows = showsData?.map(show => ({
          id: show.id,
          title: show.title,
          date: show.date,
          time: show.time,
          venue: show.venue ? {
            name: show.venue.name,
            city: show.venue.city
          } : undefined,
          earnings: show.earnings?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0
        })) || [];

        setShows(processedShows);

        // Fetch weather for shows
        if (processedShows.length > 0) {
          try {
            const weatherData = await weatherService.getWeatherForCalendar(processedShows);
            setWeather(weatherData);
          } catch (weatherError) {
            console.error('Error fetching weather:', weatherError);
            setWeather([]);
          }
        }

        // Calculate stats
        const totalEarnings = processedShows.reduce((sum, show) => sum + (show.earnings || 0), 0);
        setStats({
          totalShows: processedShows.length,
          totalEarnings
        });
        
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCalendarData();
  }, [currentOrg, useMockData]);

  // Calendar event handlers
  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    // Open add show modal with pre-selected date
    setIsAddShowOpen(true);
  };

  const handleEditShow = (show: Show) => {
    // Navigate to shows page or open edit modal
    navigate(`/shows?edit=${show.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no orgs, show create org prompt
  if (!currentOrg && userOrgs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <Music2 className="h-8 w-8 text-primary mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to ChordLine!
          </h1>
          <p className="text-muted-foreground mb-6">
            Let's start by creating your band or music organization.
          </p>
          <button
            onClick={() => setIsCreateOrgOpen(true)}
            className={cn(
              "bg-primary text-primary-foreground px-6 py-3 rounded-md",
              "font-medium hover:bg-primary/90 focus:outline-none focus:ring-2",
              "focus:ring-offset-2 focus:ring-primary"
            )}
          >
            Create Your Band
          </button>
          <CreateOrgModal 
            isOpen={isCreateOrgOpen} 
            onClose={() => setIsCreateOrgOpen(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Organization Selector */}
          <div className="relative mb-4 max-w-md">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className={cn(
                "flex items-center justify-between w-full p-2",
                "bg-background border border-border rounded-md",
                "hover:bg-accent transition-colors"
              )}
            >
              <div className="flex items-center space-x-2">
                <Music2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {currentOrg?.name || 'Select Band'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            
            {isOrgDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10">
                {userOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrg(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-accent",
                      "first:rounded-t-md last:rounded-b-md",
                      currentOrg?.id === org.id && "bg-accent"
                    )}
                  >
                    <span className="font-medium">{org.name}</span>
                    {org.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {org.description}
                      </p>
                    )}
                  </button>
                ))}
                <div className="border-t border-border">
                  <button
                    onClick={() => {
                      setIsCreateOrgOpen(true);
                      setIsOrgDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-accent rounded-b-md text-primary"
                  >
                    + Create New Band
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendar</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentOrg?.name} - Shows, earnings, and weather at a glance
              </p>
            </div>
            
            {/* Stats Summary */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.totalShows}</p>
                <p className="text-xs text-muted-foreground">Shows</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Earnings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Mobile Stats Cards */}
        <div className="md:hidden grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalShows}</p>
            <p className="text-sm text-muted-foreground">Total Shows</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </div>
        </div>

        {/* Calendar Component */}
        <div className="relative">
          {isLoadingData && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading calendar...</span>
              </div>
            </div>
          )}
          
          <MonthCalendar
            shows={shows}
            weather={weather}
            onEventSelect={handleEventSelect}
            onDateSelect={handleDateSelect}
            className={cn(isLoadingData && "opacity-50")}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsAddShowOpen(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md',
              'font-medium hover:bg-primary/90 focus:outline-none focus:ring-2',
              'focus:ring-primary focus:ring-offset-2'
            )}
          >
            <Plus className="h-4 w-4" />
            Add Show
          </button>
          
          <button 
            onClick={() => navigate('/assistant')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md',
              'font-medium hover:bg-accent focus:outline-none focus:ring-2',
              'focus:ring-primary focus:ring-offset-2'
            )}
          >
            <MessageCircle className="h-4 w-4" />
            AI Assistant
          </button>
          
          <button 
            onClick={() => navigate('/profile')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md',
              'font-medium hover:bg-accent focus:outline-none focus:ring-2',
              'focus:ring-primary focus:ring-offset-2'
            )}
          >
            <Calendar className="h-4 w-4" />
            Connections
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <CreateOrgModal 
        isOpen={isCreateOrgOpen} 
        onClose={() => setIsCreateOrgOpen(false)} 
      />
      
      {currentOrg && (
        <AddShowModal
          isOpen={isAddShowOpen}
          onClose={() => setIsAddShowOpen(false)}
          orgId={currentOrg.id}
          onShowAdded={() => {
            setIsAddShowOpen(false);
            // Refresh calendar data
            window.location.reload();
          }}
        />
      )}
      
      <EventDetailsModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        onEditShow={handleEditShow}
      />
    </div>
  );
}
