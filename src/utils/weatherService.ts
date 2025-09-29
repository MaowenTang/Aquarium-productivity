import { config } from './config';

const OPENWEATHER_API_KEY = config.openweather.apiKey;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number;
  description: string;
  main: string; // Clear, Clouds, Rain, etc.
  humidity: number;
  windSpeed: number;
  cityName: string;
  icon: string;
}

export interface WeatherRecommendation {
  activity: string;
  description: string;
  icon: string;
  oceanTheme: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'misty';
}

export const WeatherService = {
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    if (!OPENWEATHER_API_KEY) {
      console.warn('OpenWeather API key not configured, using default weather');
      return DEFAULT_WEATHER;
    }

    try {
      const response = await fetch(
        `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
    
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        main: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        cityName: data.name,
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.warn('Failed to fetch weather data:', error);
      return DEFAULT_WEATHER;
    }
  },

  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    if (!OPENWEATHER_API_KEY) {
      console.warn('OpenWeather API key not configured, using default weather');
      return DEFAULT_WEATHER;
    }

    try {
      const response = await fetch(
        `${OPENWEATHER_BASE_URL}/weather?q=${cityName}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
    
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        main: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        cityName: data.name,
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.warn('Failed to fetch weather data for city:', error);
      return { ...DEFAULT_WEATHER, cityName };
    }
  },

  getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Check permissions first if available
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'denied') {
            reject(new Error('Geolocation access has been denied'));
            return;
          }
        }).catch(() => {
          // Permissions API not available, continue with geolocation attempt
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          let errorMessage = 'Unable to access location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied by user settings or browser policy';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving location';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          timeout: 8000,
          enableHighAccuracy: false, // Changed to false to be less restrictive
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  },

  getWeatherRecommendations(weather: WeatherData): WeatherRecommendation[] {
    const temp = weather.temperature;
    const condition = weather.main.toLowerCase();
    
    const recommendations: WeatherRecommendation[] = [];

    // Temperature-based recommendations
    if (temp >= 20 && temp <= 28) {
      recommendations.push({
        activity: 'Take a peaceful walk',
        description: 'Perfect temperature for a mindful outdoor break',
        icon: '🚶‍♀️',
        oceanTheme: 'sunny'
      });
    }

    // Weather condition recommendations
    switch (condition) {
      case 'clear':
        recommendations.push(
          {
            activity: 'Outdoor meditation',
            description: 'Clear skies are perfect for connecting with nature',
            icon: '🧘‍♀️',
            oceanTheme: 'sunny'
          },
          {
            activity: 'Energizing focus session',
            description: 'Bright weather boosts concentration',
            icon: '⚡',
            oceanTheme: 'sunny'
          }
        );
        break;
      
      case 'clouds':
        recommendations.push(
          {
            activity: 'Indoor focus time',
            description: 'Cozy weather is ideal for deep work',
            icon: '📚',
            oceanTheme: 'cloudy'
          },
          {
            activity: 'Gentle breathing exercise',
            description: 'Soft skies encourage calm reflection',
            icon: '🌬️',
            oceanTheme: 'cloudy'
          }
        );
        break;
      
      case 'rain':
        recommendations.push(
          {
            activity: 'Rain sound meditation',
            description: 'Let the rain sounds guide your practice',
            icon: '🌧️',
            oceanTheme: 'rainy'
          },
          {
            activity: 'Cozy planning session',
            description: 'Perfect time to organize your thoughts',
            icon: '📝',
            oceanTheme: 'rainy'
          }
        );
        break;
      
      case 'snow':
        recommendations.push(
          {
            activity: 'Mindful hot tea break',
            description: 'Warm up with a peaceful moment',
            icon: '🍵',
            oceanTheme: 'misty'
          },
          {
            activity: 'Winter reflection time',
            description: 'Snow encourages quiet contemplation',
            icon: '❄️',
            oceanTheme: 'misty'
          }
        );
        break;
      
      default:
        recommendations.push(
          {
            activity: '5-minute meditation',
            description: 'Any weather is perfect for inner peace',
            icon: '🧘',
            oceanTheme: 'cloudy'
          }
        );
    }

    // Add a productivity recommendation based on time of day
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 11) {
      recommendations.push({
        activity: 'Morning productivity boost',
        description: 'Prime time for tackling important tasks',
        icon: '🌅',
        oceanTheme: 'sunny'
      });
    } else if (hour >= 14 && hour <= 16) {
      recommendations.push({
        activity: 'Afternoon focus session',
        description: 'Beat the afternoon slump with deep work',
        icon: '💪',
        oceanTheme: 'cloudy'
      });
    }

    return recommendations.slice(0, 3); // Return max 3 recommendations
  },

  getOceanThemeFromWeather(weather: WeatherData): {
    backgroundClass: string;
    accentColor: string;
    particles: string;
    lighting: string;
  } {
    const condition = weather.main.toLowerCase();
    const temp = weather.temperature;

    switch (condition) {
      case 'clear':
        return {
          backgroundClass: 'from-blue-200 via-cyan-100 to-yellow-100',
          accentColor: 'text-yellow-600',
          particles: 'sparkles',
          lighting: 'bright'
        };
      
      case 'clouds':
        return {
          backgroundClass: 'from-gray-200 via-blue-200 to-slate-200',
          accentColor: 'text-blue-600',
          particles: 'gentle-waves',
          lighting: 'soft'
        };
      
      case 'rain':
        return {
          backgroundClass: 'from-slate-300 via-blue-300 to-gray-400',
          accentColor: 'text-slate-600',
          particles: 'rain-drops',
          lighting: 'dim'
        };
      
      case 'thunderstorm':
        return {
          backgroundClass: 'from-gray-500 via-slate-400 to-blue-500',
          accentColor: 'text-purple-600',
          particles: 'lightning',
          lighting: 'dramatic'
        };
      
      case 'snow':
        return {
          backgroundClass: 'from-blue-100 via-white to-cyan-50',
          accentColor: 'text-cyan-600',
          particles: 'snowflakes',
          lighting: 'crystalline'
        };
      
      default:
        return {
          backgroundClass: 'from-blue-200 via-cyan-200 to-blue-300',
          accentColor: 'text-blue-600',
          particles: 'bubbles',
          lighting: 'ambient'
        };
    }
  }
};

// Default weather data for offline/error states
export const DEFAULT_WEATHER: WeatherData = {
  temperature: 22,
  description: 'pleasant conditions',
  main: 'Clear',
  humidity: 60,
  windSpeed: 5,
  cityName: 'Your location',
  icon: '01d'
};