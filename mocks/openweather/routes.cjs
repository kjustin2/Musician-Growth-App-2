const express = require('express');
const router = express.Router();

// Mock weather data for different cities
const weatherData = {
  'nashville': {
    coord: { lon: -86.7816, lat: 36.1627 },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    base: 'stations',
    main: {
      temp: 72.5,
      feels_like: 75.2,
      temp_min: 68.0,
      temp_max: 78.0,
      pressure: 1015,
      humidity: 45
    },
    visibility: 10000,
    wind: { speed: 8.2, deg: 190 },
    clouds: { all: 0 },
    dt: Math.floor(Date.now() / 1000),
    sys: {
      type: 1,
      id: 4608,
      country: 'US',
      sunrise: Math.floor(Date.now() / 1000) - 3600,
      sunset: Math.floor(Date.now() / 1000) + 36000
    },
    timezone: -18000,
    id: 4644585,
    name: 'Nashville',
    cod: 200
  },
  'new york': {
    coord: { lon: -74.006, lat: 40.7143 },
    weather: [{ id: 803, main: 'Clouds', description: 'broken clouds', icon: '04d' }],
    base: 'stations',
    main: {
      temp: 65.8,
      feels_like: 68.2,
      temp_min: 62.0,
      temp_max: 69.0,
      pressure: 1012,
      humidity: 60
    },
    visibility: 8000,
    wind: { speed: 12.5, deg: 230 },
    clouds: { all: 75 },
    dt: Math.floor(Date.now() / 1000),
    sys: {
      type: 1,
      id: 4610,
      country: 'US',
      sunrise: Math.floor(Date.now() / 1000) - 3600,
      sunset: Math.floor(Date.now() / 1000) + 36000
    },
    timezone: -18000,
    id: 5128581,
    name: 'New York',
    cod: 200
  },
  'san francisco': {
    coord: { lon: -122.4194, lat: 37.7749 },
    weather: [{ id: 701, main: 'Mist', description: 'mist', icon: '50d' }],
    base: 'stations',
    main: {
      temp: 58.3,
      feels_like: 60.1,
      temp_min: 55.0,
      temp_max: 62.0,
      pressure: 1018,
      humidity: 85
    },
    visibility: 5000,
    wind: { speed: 6.8, deg: 270 },
    clouds: { all: 90 },
    dt: Math.floor(Date.now() / 1000),
    sys: {
      type: 1,
      id: 4612,
      country: 'US',
      sunrise: Math.floor(Date.now() / 1000) - 3600,
      sunset: Math.floor(Date.now() / 1000) + 36000
    },
    timezone: -28800,
    id: 5391959,
    name: 'San Francisco',
    cod: 200
  },
  'austin': {
    coord: { lon: -97.7431, lat: 30.2672 },
    weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
    base: 'stations',
    main: {
      temp: 78.4,
      feels_like: 82.1,
      temp_min: 75.0,
      temp_max: 83.0,
      pressure: 1010,
      humidity: 78
    },
    visibility: 6000,
    wind: { speed: 11.2, deg: 160 },
    clouds: { all: 85 },
    rain: { '1h': 0.5 },
    dt: Math.floor(Date.now() / 1000),
    sys: {
      type: 1,
      id: 4614,
      country: 'US',
      sunrise: Math.floor(Date.now() / 1000) - 3600,
      sunset: Math.floor(Date.now() / 1000) + 36000
    },
    timezone: -21600,
    id: 4671654,
    name: 'Austin',
    cod: 200
  }
};

// Mock forecast data
const forecastData = {
  cod: '200',
  message: 0,
  cnt: 40,
  list: [
    {
      dt: Math.floor(Date.now() / 1000) + 3600,
      main: {
        temp: 75.2,
        feels_like: 77.8,
        temp_min: 72.5,
        temp_max: 78.0,
        pressure: 1015,
        sea_level: 1015,
        grnd_level: 1012,
        humidity: 48
      },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      clouds: { all: 5 },
      wind: { speed: 8.5, deg: 185, gust: 12.1 },
      visibility: 10000,
      pop: 0.1,
      sys: { pod: 'd' },
      dt_txt: new Date(Date.now() + 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19)
    },
    {
      dt: Math.floor(Date.now() / 1000) + 7200,
      main: {
        temp: 73.8,
        feels_like: 76.2,
        temp_min: 70.5,
        temp_max: 76.0,
        pressure: 1016,
        sea_level: 1016,
        grnd_level: 1013,
        humidity: 52
      },
      weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
      clouds: { all: 15 },
      wind: { speed: 7.8, deg: 190, gust: 11.5 },
      visibility: 10000,
      pop: 0.15,
      sys: { pod: 'd' },
      dt_txt: new Date(Date.now() + 7200 * 1000).toISOString().replace('T', ' ').slice(0, 19)
    }
  ],
  city: {
    id: 4644585,
    name: 'Nashville',
    coord: { lat: 36.1627, lon: -86.7816 },
    country: 'US',
    population: 691243,
    timezone: -18000,
    sunrise: Math.floor(Date.now() / 1000) - 3600,
    sunset: Math.floor(Date.now() / 1000) + 36000
  }
};

// Current weather endpoint
router.get('/weather', (req, res) => {
  const { q: city, appid, units } = req.query;
  
  if (!appid) {
    return res.status(401).json({
      cod: 401,
      message: 'Invalid API key. Please see http://openweathermap.org/faq#error401 for more info.'
    });
  }
  
  if (!city) {
    return res.status(400).json({
      cod: 400,
      message: 'Nothing to geocode'
    });
  }
  
  const cityKey = city.toLowerCase();
  const weather = weatherData[cityKey];
  
  if (!weather) {
    // Return generic weather for unknown cities
    return res.json({
      coord: { lon: 0, lat: 0 },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      base: 'stations',
      main: {
        temp: units === 'metric' ? 22 : 72,
        feels_like: units === 'metric' ? 24 : 75,
        temp_min: units === 'metric' ? 18 : 65,
        temp_max: units === 'metric' ? 26 : 80,
        pressure: 1015,
        humidity: 50
      },
      visibility: 10000,
      wind: { speed: units === 'metric' ? 3.6 : 8.0, deg: 180 },
      clouds: { all: 20 },
      dt: Math.floor(Date.now() / 1000),
      sys: {
        type: 1,
        id: 9999,
        country: 'US',
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 36000
      },
      timezone: -18000,
      id: 9999999,
      name: city,
      cod: 200
    });
  }
  
  // Convert temperature units if needed
  let responseWeather = JSON.parse(JSON.stringify(weather));
  if (units === 'metric') {
    responseWeather.main.temp = ((weather.main.temp - 32) * 5/9);
    responseWeather.main.feels_like = ((weather.main.feels_like - 32) * 5/9);
    responseWeather.main.temp_min = ((weather.main.temp_min - 32) * 5/9);
    responseWeather.main.temp_max = ((weather.main.temp_max - 32) * 5/9);
    responseWeather.wind.speed = weather.wind.speed * 0.44704; // mph to m/s
  }
  
  res.json(responseWeather);
});

// 5-day forecast endpoint
router.get('/forecast', (req, res) => {
  const { q: city, appid, units, cnt } = req.query;
  
  if (!appid) {
    return res.status(401).json({
      cod: 401,
      message: 'Invalid API key. Please see http://openweathermap.org/faq#error401 for more info.'
    });
  }
  
  if (!city) {
    return res.status(400).json({
      cod: 400,
      message: 'Nothing to geocode'
    });
  }
  
  // Generate forecast data
  let forecast = JSON.parse(JSON.stringify(forecastData));
  forecast.city.name = city;
  
  // Limit results if cnt parameter is provided
  if (cnt) {
    forecast.list = forecast.list.slice(0, parseInt(cnt));
    forecast.cnt = forecast.list.length;
  }
  
  // Convert temperature units if needed
  if (units === 'metric') {
    forecast.list = forecast.list.map(item => ({
      ...item,
      main: {
        ...item.main,
        temp: (item.main.temp - 32) * 5/9,
        feels_like: (item.main.feels_like - 32) * 5/9,
        temp_min: (item.main.temp_min - 32) * 5/9,
        temp_max: (item.main.temp_max - 32) * 5/9
      },
      wind: {
        ...item.wind,
        speed: item.wind.speed * 0.44704
      }
    }));
  }
  
  res.json(forecast);
});

// One Call API endpoint (for more detailed weather data)
router.get('/onecall', (req, res) => {
  const { lat, lon, appid, exclude, units } = req.query;
  
  if (!appid) {
    return res.status(401).json({
      cod: 401,
      message: 'Invalid API key. Please see http://openweathermap.org/faq#error401 for more info.'
    });
  }
  
  const oneCallData = {
    lat: parseFloat(lat) || 36.1627,
    lon: parseFloat(lon) || -86.7816,
    timezone: 'America/Chicago',
    timezone_offset: -21600,
    current: {
      dt: Math.floor(Date.now() / 1000),
      sunrise: Math.floor(Date.now() / 1000) - 3600,
      sunset: Math.floor(Date.now() / 1000) + 36000,
      temp: units === 'metric' ? 22.5 : 72.5,
      feels_like: units === 'metric' ? 24.2 : 75.2,
      pressure: 1015,
      humidity: 45,
      dew_point: units === 'metric' ? 12.8 : 55.0,
      uvi: 6.5,
      clouds: 0,
      visibility: 10000,
      wind_speed: units === 'metric' ? 3.6 : 8.2,
      wind_deg: 190,
      weather: [
        { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
      ]
    },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      dt: Math.floor(Date.now() / 1000) + (i * 3600),
      temp: units === 'metric' ? (20 + Math.random() * 10) : (68 + Math.random() * 18),
      feels_like: units === 'metric' ? (22 + Math.random() * 10) : (72 + Math.random() * 18),
      pressure: 1015 + Math.random() * 10 - 5,
      humidity: 40 + Math.random() * 30,
      dew_point: units === 'metric' ? (10 + Math.random() * 8) : (50 + Math.random() * 15),
      uvi: i > 6 && i < 18 ? Math.random() * 8 : 0,
      clouds: Math.floor(Math.random() * 100),
      visibility: 8000 + Math.random() * 2000,
      wind_speed: units === 'metric' ? (2 + Math.random() * 6) : (4.5 + Math.random() * 13.5),
      wind_deg: 180 + Math.random() * 60 - 30,
      weather: [
        { id: 800, main: 'Clear', description: 'clear sky', icon: i > 6 && i < 18 ? '01d' : '01n' }
      ],
      pop: Math.random() * 0.3
    })),
    daily: Array.from({ length: 8 }, (_, i) => ({
      dt: Math.floor(Date.now() / 1000) + (i * 86400),
      sunrise: Math.floor(Date.now() / 1000) + (i * 86400) - 3600,
      sunset: Math.floor(Date.now() / 1000) + (i * 86400) + 36000,
      moonrise: Math.floor(Date.now() / 1000) + (i * 86400) + 43200,
      moonset: Math.floor(Date.now() / 1000) + (i * 86400) + 7200,
      moon_phase: Math.random(),
      temp: {
        day: units === 'metric' ? (20 + Math.random() * 8) : (68 + Math.random() * 15),
        min: units === 'metric' ? (15 + Math.random() * 5) : (59 + Math.random() * 9),
        max: units === 'metric' ? (25 + Math.random() * 5) : (77 + Math.random() * 9),
        night: units === 'metric' ? (16 + Math.random() * 4) : (61 + Math.random() * 7),
        eve: units === 'metric' ? (22 + Math.random() * 3) : (72 + Math.random() * 5),
        morn: units === 'metric' ? (18 + Math.random() * 3) : (64 + Math.random() * 5)
      },
      feels_like: {
        day: units === 'metric' ? (22 + Math.random() * 8) : (72 + Math.random() * 15),
        night: units === 'metric' ? (18 + Math.random() * 4) : (64 + Math.random() * 7),
        eve: units === 'metric' ? (24 + Math.random() * 3) : (75 + Math.random() * 5),
        morn: units === 'metric' ? (20 + Math.random() * 3) : (68 + Math.random() * 5)
      },
      pressure: 1015 + Math.random() * 10 - 5,
      humidity: 40 + Math.random() * 30,
      dew_point: units === 'metric' ? (10 + Math.random() * 8) : (50 + Math.random() * 15),
      wind_speed: units === 'metric' ? (3 + Math.random() * 5) : (7 + Math.random() * 11),
      wind_deg: 180 + Math.random() * 60 - 30,
      weather: [
        { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
      ],
      clouds: Math.floor(Math.random() * 50),
      pop: Math.random() * 0.4,
      uvi: 6 + Math.random() * 3
    }))
  };
  
  // Handle exclude parameter
  if (exclude) {
    const excludeList = exclude.split(',');
    excludeList.forEach(item => {
      delete oneCallData[item];
    });
  }
  
  res.json(oneCallData);
});

module.exports = router;