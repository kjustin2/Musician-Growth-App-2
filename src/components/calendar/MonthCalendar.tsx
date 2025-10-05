import { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Cloud, Sun, CloudRain } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

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

interface WeatherData {
  date: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    show: Show;
    weather?: WeatherData;
    earnings?: number;
  };
}

interface MonthCalendarProps {
  shows: Show[];
  weather: WeatherData[];
  onEventSelect?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const localizer = momentLocalizer(moment);

// Weather icon mapping
const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
    return <CloudRain className="h-3 w-3" />;
  } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
    return <Cloud className="h-3 w-3" />;
  } else {
    return <Sun className="h-3 w-3" />;
  }
};

// Custom Event Component
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const { show, weather, earnings } = event.resource;
  
  return (
    <div className="text-xs p-1 bg-primary text-primary-foreground rounded-sm">
      <div className="flex items-center justify-between">
        <span className="truncate font-medium">{show.title || show.venue?.name}</span>
        {weather && (
          <span className="ml-1 flex items-center text-primary-foreground/80">
            {getWeatherIcon(weather.condition)}
          </span>
        )}
      </div>
      {earnings && (
        <div className="text-primary-foreground/80 font-medium">
          ${earnings.toLocaleString()}
        </div>
      )}
      {weather && (
        <div className="text-primary-foreground/70">
          {Math.round(weather.temperature)}°F
        </div>
      )}
    </div>
  );
};

// Custom Toolbar
const CustomToolbar = ({ date, onNavigate, onView, view }: {
  date: Date;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE', date?: Date) => void;
  onView: (view: View) => void;
  view: View;
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onNavigate('PREV')}
          className={cn(
            'p-2 rounded-md border border-border hover:bg-accent',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className={cn(
            'p-2 rounded-md border border-border hover:bg-accent',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className={cn(
            'px-3 py-2 rounded-md border border-border hover:bg-accent text-sm font-medium',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          Today
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          {moment(date).format('MMMM YYYY')}
        </h2>
      </div>
      
      <div className="flex items-center space-x-1">
        {['month', 'week', 'day'].map((v) => (
          <button
            key={v}
            onClick={() => onView(v as View)}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium capitalize',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              view === v 
                ? 'bg-primary text-primary-foreground' 
                : 'border border-border hover:bg-accent'
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function MonthCalendar({
  shows,
  weather,
  onEventSelect,
  onDateSelect,
  className
}: MonthCalendarProps) {
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert shows to calendar events
  const events = useMemo((): CalendarEvent[] => {
    return shows.map(show => {
      const showDate = new Date(show.date);
      const showTime = show.time ? show.time.split(':') : ['20', '00'];
      const startDate = new Date(showDate.setHours(parseInt(showTime[0]), parseInt(showTime[1])));
      const endDate = new Date(startDate.getTime() + (3 * 60 * 60 * 1000)); // 3 hour default duration
      
      // Find weather for this date
      const showWeather = weather.find(w => 
        moment(w.date).format('YYYY-MM-DD') === moment(showDate).format('YYYY-MM-DD')
      );

      return {
        id: show.id,
        title: show.title || show.venue?.name || 'Show',
        start: startDate,
        end: endDate,
        resource: {
          show,
          weather: showWeather,
          earnings: show.earnings
        }
      };
    });
  }, [shows, weather]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onEventSelect?.(event);
  }, [onEventSelect]);

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    onDateSelect?.(start);
  }, [onDateSelect]);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  // Calendar formats
  const formats = {
    dayFormat: 'DD',
    dayHeaderFormat: 'dddd',
    monthHeaderFormat: 'MMMM YYYY',
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
    agendaDateFormat: 'MMM DD',
    agendaTimeFormat: 'h:mm A',
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`,
  };

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4", className)}>
      <CustomToolbar
        date={currentDate}
        onNavigate={(action, date) => {
          if (action === 'PREV') {
            handleNavigate(moment(currentDate).subtract(1, currentView).toDate());
          } else if (action === 'NEXT') {
            handleNavigate(moment(currentDate).add(1, currentView).toDate());
          } else if (action === 'TODAY') {
            handleNavigate(new Date());
          } else if (date) {
            handleNavigate(date);
          }
        }}
        onView={handleViewChange}
        view={currentView}
      />
      
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          formats={formats}
          components={{
            event: EventComponent,
            toolbar: () => null, // We use our custom toolbar
          }}
          style={{ height: currentView === 'month' ? 500 : 400 }}
          className="rbc-calendar-custom"
          eventPropGetter={(event) => ({
            className: 'bg-primary text-primary-foreground border-primary',
            style: {
              backgroundColor: 'hsl(var(--primary))',
              borderColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }
          })}
          dayPropGetter={(date) => {
            const isToday = moment(date).isSame(moment(), 'day');
            return {
              className: isToday ? 'rbc-today-custom' : '',
              style: isToday ? {
                backgroundColor: 'hsl(var(--primary) / 0.1)',
              } : {}
            };
          }}
        />
      </div>
    </div>
  );
}