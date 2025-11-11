import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, MapPin, RefreshCw } from 'lucide-react';
import { WeatherService, WeatherData, WeatherRecommendation, DEFAULT_WEATHER } from '../utils/weatherService';

interface WeatherDisplayProps {
  onActivitySelect?: (activity: string) => void;
  showRecommendations?: boolean;
}

export function WeatherDisplay({ onActivitySelect, showRecommendations = true }: WeatherDisplayProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<WeatherRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      let weatherData: WeatherData;
      
      // Try to get user's location first
      try {
        const location = await WeatherService.getCurrentLocation();
        weatherData = await WeatherService.getCurrentWeather(location.lat, location.lon);
        console.log('🌍 Weather loaded from your location');
      } catch (locationError) {
        // Silently fallback to default city without logging the error as a warning
        console.log('📍 Using default location for weather (location access not available)');
        try {
          weatherData = await WeatherService.getWeatherByCity('San Francisco');
        } catch (cityError) {
          console.log('🌊 Using default weather data (API not available)');
          weatherData = DEFAULT_WEATHER;
        }
      }

      setWeather(weatherData);
      
      if (showRecommendations) {
        const recs = WeatherService.getWeatherRecommendations(weatherData);
        setRecommendations(recs);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Weather fetch failed:', err);
      setError('Unable to load weather data');
      // Use default weather data
      setWeather(DEFAULT_WEATHER);
      if (showRecommendations) {
        setRecommendations(WeatherService.getWeatherRecommendations(DEFAULT_WEATHER));
      }
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string, isAnimated = false) => {
    const baseClasses = isAnimated ? "h-8 w-8" : "h-6 w-6";
    
    if (condition.toLowerCase().includes('sun') || condition.toLowerCase().includes('clear')) {
      return <Sun className={`${baseClasses} text-yellow-500`} />;
    } else if (condition.toLowerCase().includes('rain')) {
      return <CloudRain className={`${baseClasses} text-blue-500`} />;
    } else if (condition.toLowerCase().includes('cloud')) {
      return <Cloud className={`${baseClasses} text-gray-500`} />;
    } else {
      return <Cloud className={`${baseClasses} text-blue-500`} />;
    }
  };

  const getOceanTheme = () => {
    if (!weather) return WeatherService.getOceanThemeFromWeather(DEFAULT_WEATHER);
    return WeatherService.getOceanThemeFromWeather(weather);
  };

  const theme = getOceanTheme();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <Card className="glass-morandi float-3d overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity } }}
              >
                <span className="text-2xl">🌊</span>
              </motion.div>
              <div className="space-y-3">
                <div className="h-6 bg-blue-200/50 rounded animate-pulse w-32" />
                <div className="h-4 bg-blue-100/50 rounded animate-pulse w-24" />
                <div className="h-3 bg-blue-50/50 rounded animate-pulse w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error && !weather) {
    return (
      <Card className="glass-morandi border-blue-200/30 float-3d">
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className="text-blue-600">
              <Cloud className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Weather Service Unavailable</p>
              <p className="text-sm text-blue-600/80">Using default peaceful conditions</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadWeather}
              className="glass-morandi border-white/30 hover:morandi-blue"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="space-y-4 w-full"
    >
      {/* Main Weather Card */}
      <Card className={`glass-morandi float-3d overflow-hidden bg-gradient-to-br ${theme.backgroundClass} h-full`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {getWeatherIcon(weather?.main || 'Clear', true)}
              </motion.div>
              <span className="text-lg md:text-xl">Ocean Weather</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadWeather}
              className="opacity-70 hover:opacity-100 rounded-full w-8 h-8 p-0"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1">
          <div className="space-y-4 h-full">
            {/* Temperature and condition */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <motion.p 
                  className={`text-4xl md:text-5xl lg:text-4xl font-medium ${theme.accentColor}`}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {weather?.temperature}°C
                </motion.p>
                <p className="text-blue-700 capitalize text-base md:text-lg">{weather?.description}</p>
                <div className="flex items-center gap-1 text-blue-600 text-sm mt-1 flex-wrap">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="flex-shrink-0">{weather?.cityName}</span>
                  {weather?.cityName === 'San Francisco' && (
                    <span className="text-xs text-blue-500/70 ml-1 px-1.5 py-0.5 bg-blue-100/50 rounded-full whitespace-nowrap">
                      📍 Set your location in Settings
                    </span>
                  )}
                </div>
              </div>
              
              <motion.div
                className="relative flex-shrink-0"
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
              >
                <div className="text-6xl md:text-7xl lg:text-6xl filter drop-shadow-lg">
                  {weather?.main === 'Clear' ? '☀️' :
                   weather?.main === 'Clouds' ? '☁️' :
                   weather?.main === 'Rain' ? '🌧️' :
                   weather?.main === 'Snow' ? '❄️' : '🌊'}
                </div>
                
                {/* Weather particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {theme.particles === 'sparkles' && (
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                          style={{
                            left: `${20 + i * 20}%`,
                            top: `${30 + i * 15}%`,
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        />
                      ))}
                    </>
                  )}
                  
                  {theme.particles === 'rain-drops' && (
                    <>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-0.5 h-3 bg-blue-400 rounded-full"
                          style={{
                            left: `${10 + i * 25}%`,
                            top: '-10%',
                          }}
                          animate={{
                            y: [0, 60],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Weather details */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/20">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <Droplets className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-blue-600/80">Humidity</p>
                  <p className="text-sm font-medium text-blue-800">{weather?.humidity}%</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <Wind className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-blue-600/80">Wind</p>
                  <p className="text-sm font-medium text-blue-800">{weather?.windSpeed} m/s</p>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-morandi float-3d">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <span className="text-lg md:text-xl">🧘</span>
                Perfect Weather Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                <AnimatePresence>
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <motion.div
                        className="p-3 md:p-4 rounded-2xl glass-morandi border border-white/20 cursor-pointer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onActivitySelect?.(rec.activity)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl md:text-2xl flex-shrink-0">{rec.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-blue-800 text-sm md:text-base truncate">{rec.activity}</p>
                            <p className="text-xs md:text-sm text-blue-600/80">{rec.description}</p>
                          </div>
                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            whileHover={{ x: 5 }}
                          >
                            <span className="text-blue-500 text-lg">→</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Last updated info */}
      {lastUpdated && (
        <motion.p 
          className="text-xs text-blue-500/70 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.p>
      )}
    </motion.div>
  );
}