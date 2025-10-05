import { X, Calendar, MapPin, Clock, DollarSign, Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEditShow?: (show: Show) => void;
}

// Weather icon mapping
const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
    return <CloudRain className="h-5 w-5" />;
  } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
    return <Cloud className="h-5 w-5" />;
  } else {
    return <Sun className="h-5 w-5" />;
  }
};

export default function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onEditShow
}: EventDetailsModalProps) {
  if (!isOpen || !event) return null;

  const { show, weather, earnings } = event.resource;
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeatherRecommendation = (weather: WeatherData) => {
    if (weather.condition.toLowerCase().includes('rain')) {
      return 'Consider covered area or indoor backup plan ☔';
    } else if (weather.temperature < 50) {
      return 'Cold weather - dress warmly and check equipment 🧥';
    } else if (weather.temperature > 85) {
      return 'Hot weather - stay hydrated and ensure ventilation 🌡️';
    } else if (weather.condition.toLowerCase().includes('cloud')) {
      return 'Great weather for outdoor performances! ⛅';
    } else {
      return 'Perfect weather conditions! ☀️';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground truncate">
            {show.title || show.venue?.name || 'Show Details'}
          </h2>
          <button
            onClick={onClose}
            className={cn(
              'p-1 rounded-md hover:bg-accent text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Date and Time */}
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {formatDate(event.start)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(event.start)} - {formatTime(event.end)}
              </p>
            </div>
          </div>

          {/* Venue */}
          {show.venue && (
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">{show.venue.name}</p>
                <p className="text-sm text-muted-foreground">{show.venue.city}</p>
              </div>
            </div>
          )}

          {/* Earnings */}
          {earnings && earnings > 0 && (
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-md">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">${earnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Expected earnings</p>
              </div>
            </div>
          )}

          {/* Weather */}
          {weather && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-sky-100 p-2 rounded-md">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-foreground">{weather.condition}</p>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Thermometer className="h-3 w-3" />
                      <span>{Math.round(weather.temperature)}°F</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {weather.condition.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Weather details */}
              <div className="bg-muted/50 rounded-md p-3 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Humidity:</span>
                    <span className="ml-1 font-medium">{weather.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind:</span>
                    <span className="ml-1 font-medium">{weather.windSpeed} mph</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {getWeatherRecommendation(weather)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-2">
          {onEditShow && (
            <button
              onClick={() => {
                onEditShow(show);
                onClose();
              }}
              className={cn(
                'w-full bg-primary text-primary-foreground px-4 py-2 rounded-md',
                'font-medium hover:bg-primary/90 focus:outline-none focus:ring-2',
                'focus:ring-primary focus:ring-offset-2'
              )}
            >
              Edit Show Details
            </button>
          )}
          <button
            onClick={onClose}
            className={cn(
              'w-full bg-muted text-muted-foreground px-4 py-2 rounded-md',
              'font-medium hover:bg-muted/80 focus:outline-none focus:ring-2',
              'focus:ring-primary focus:ring-offset-2'
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}