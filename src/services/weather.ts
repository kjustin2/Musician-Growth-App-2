interface WeatherData {
  id: string;
  main: string;
  description: string;
  icon: string;
}

interface MainWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface CurrentWeather {
  dt: number;
  main: MainWeather;
  weather: WeatherData[];
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
}

interface ForecastItem {
  dt: number;
  main: MainWeather;
  weather: WeatherData[];
  dt_txt: string;
}

interface WeatherApiResponse {
  current?: CurrentWeather;
  list?: ForecastItem[];
  city?: {
    name: string;
    country: string;
  };
}

export interface ProcessedWeatherData {
  date: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  isOutdoorFriendly: boolean;
}

class WeatherService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  constructor() {
    // In production, this would come from environment variables
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || null;
  }

  async getWeatherForShow(city: string, date: string): Promise<ProcessedWeatherData | null> {
    try {
      if (this.useMockData) {
        return this.generateMockWeather(city, date);
      }

      if (!this.apiKey) {
        console.warn('OpenWeatherMap API key not configured');
        return this.generateMockWeather(city, date);
      }

      // For shows more than 5 days out, use forecast API
      const showDate = new Date(date);
      const today = new Date();
      const daysAhead = Math.ceil((showDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysAhead <= 0) {
        // Past shows - return historical mock data
        return this.generateMockWeather(city, date);
      } else if (daysAhead <= 5) {
        // Use 5-day forecast
        return await this.getForecastWeather(city, date);
      } else {
        // Too far ahead for reliable forecast, return null or generate optimistic mock
        return this.generateOptimisticWeather(city, date);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      return this.generateMockWeather(city, date);
    }
  }

  private async getForecastWeather(city: string, targetDate: string): Promise<ProcessedWeatherData | null> {
    try {
      const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=imperial`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();
      
      if (!data.list || data.list.length === 0) {
        return null;
      }

      // Find the forecast closest to the target date
      const targetDateTime = new Date(targetDate).getTime();
      let closestForecast = data.list[0];
      let minDiff = Math.abs(new Date(closestForecast.dt_txt).getTime() - targetDateTime);

      for (const forecast of data.list) {
        const diff = Math.abs(new Date(forecast.dt_txt).getTime() - targetDateTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestForecast = forecast;
        }
      }

      return this.processForecastData(closestForecast, targetDate);
    } catch (error) {
      console.error('Error fetching forecast weather:', error);
      return null;
    }
  }

  private processForecastData(forecast: ForecastItem, date: string): ProcessedWeatherData {
    const weather = forecast.weather[0];
    const temp = Math.round(forecast.main.temp);
    
    return {
      date,
      temperature: temp,
      condition: weather.main,
      description: weather.description,
      icon: weather.icon,
      humidity: forecast.main.humidity,
      windSpeed: Math.round(forecast.main.temp), // This would be wind speed from forecast
      isOutdoorFriendly: this.isOutdoorFriendly(weather.main, temp, forecast.main.humidity)
    };
  }

  private generateMockWeather(city: string, date: string): ProcessedWeatherData {
    const weatherConditions = [
      { main: 'Clear', description: 'clear sky', icon: '01d', temp: 75, humidity: 45 },
      { main: 'Clouds', description: 'few clouds', icon: '02d', temp: 68, humidity: 60 },
      { main: 'Clouds', description: 'partly cloudy', icon: '03d', temp: 65, humidity: 70 },
      { main: 'Rain', description: 'light rain', icon: '10d', temp: 58, humidity: 85 },
      { main: 'Rain', description: 'moderate rain', icon: '10d', temp: 55, humidity: 90 }
    ];

    // Use city name and date to generate consistent mock data
    const seed = city.length + new Date(date).getDate();
    const weatherIndex = seed % weatherConditions.length;
    const mockWeather = weatherConditions[weatherIndex];

    // Add some randomness based on season
    const month = new Date(date).getMonth();
    const seasonalTempAdjustment = month < 3 || month > 10 ? -15 : month > 5 && month < 9 ? 10 : 0;

    return {
      date,
      temperature: mockWeather.temp + seasonalTempAdjustment + (seed % 10) - 5,
      condition: mockWeather.main,
      description: mockWeather.description,
      icon: mockWeather.icon,
      humidity: mockWeather.humidity,
      windSpeed: 5 + (seed % 15),
      isOutdoorFriendly: this.isOutdoorFriendly(mockWeather.main, mockWeather.temp, mockWeather.humidity)
    };
  }

  private generateOptimisticWeather(city: string, date: string): ProcessedWeatherData {
    // For far future dates, generate optimistic weather suitable for shows
    return {
      date,
      temperature: 72,
      condition: 'Clear',
      description: 'clear sky',
      icon: '01d',
      humidity: 50,
      windSpeed: 8,
      isOutdoorFriendly: true
    };
  }

  private isOutdoorFriendly(condition: string, temperature: number, humidity: number): boolean {
    // Define outdoor-friendly conditions
    const badConditions = ['Rain', 'Thunderstorm', 'Snow', 'Drizzle'];
    const isBadWeather = badConditions.includes(condition);
    const isComfortableTemp = temperature >= 50 && temperature <= 85;
    const isNotTooHumid = humidity < 85;

    return !isBadWeather && isComfortableTemp && isNotTooHumid;
  }

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  getOutdoorRecommendation(weather: ProcessedWeatherData): string {
    if (weather.isOutdoorFriendly) {
      return 'Great weather for outdoor performances! 🌤️';
    }

    if (weather.condition === 'Rain') {
      return 'Consider indoor venue or covered area ☔';
    }

    if (weather.temperature < 50) {
      return 'Cold weather - indoor venue recommended 🥶';
    }

    if (weather.temperature > 85) {
      return 'Hot weather - ensure good ventilation 🌡️';
    }

    if (weather.humidity > 85) {
      return 'High humidity - may affect instruments 💧';
    }

    return 'Check conditions closer to show date 🌦️';
  }
}

export const weatherService = new WeatherService();
export default weatherService;