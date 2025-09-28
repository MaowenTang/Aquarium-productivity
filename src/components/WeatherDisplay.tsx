import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  description: string;
  humidity: number;
}

export function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Mock weather data - in a real app, this would fetch from a weather API
    const mockWeather: WeatherData = {
      temperature: 22,
      condition: 'sunny',
      description: 'Partly cloudy with gentle breeze',
      humidity: 65
    };
    
    // Simulate API delay
    setTimeout(() => setWeather(mockWeather), 1000);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getWeatherEmoji = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      default: return '☀️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-sm"
    >
      <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-blue-500">🌊</span>
            Current Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!weather ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(weather.condition)}
                  <div>
                    <div className="text-2xl font-semibold">{weather.temperature}°C</div>
                    <div className="text-sm text-muted-foreground">Feels perfect</div>
                  </div>
                </div>
                <div className="text-4xl">
                  {getWeatherEmoji(weather.condition)}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-blue-600">{weather.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Thermometer className="h-4 w-4" />
                  <span>Humidity: {weather.humidity}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/20">
                <div className="text-center">
                  <p className="text-sm text-blue-600 mb-2">Perfect day for productivity!</p>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🌅
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}