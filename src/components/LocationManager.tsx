import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MapPin, 
  Navigation, 
  Globe,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Loader2,
  Info
} from 'lucide-react';
import { WeatherService, WeatherData } from '../utils/weatherService';

interface LocationManagerProps {
  currentLocation: string | null;
  onLocationChange: (location: string | null) => Promise<void>;
}

export function LocationManager({ currentLocation, onLocationChange }: LocationManagerProps) {
  const [locationInput, setLocationInput] = useState(currentLocation || '');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'unknown' | 'available' | 'denied' | 'unavailable'>('unknown');
  const [weatherPreview, setWeatherPreview] = useState<WeatherData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    checkLocationPermission();
    if (currentLocation) {
      validateLocation(currentLocation);
    }
  }, [currentLocation]);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          setLocationStatus('available');
        } else if (permission.state === 'denied') {
          setLocationStatus('denied');
        } else {
          setLocationStatus('unknown');
        }
      } else {
        setLocationStatus('unknown');
      }
    } catch {
      setLocationStatus('unknown');
    }
  };

  const detectCurrentLocation = async () => {
    setIsDetecting(true);
    setValidationError(null);

    try {
      const location = await WeatherService.getCurrentLocation();
      const weather = await WeatherService.getCurrentWeather(location.lat, location.lon);
      
      setLocationInput(weather.cityName);
      setWeatherPreview(weather);
      await onLocationChange(weather.cityName);
      setLocationStatus('available');
      
    } catch (error) {
      console.log('Location detection failed:', error);
      setLocationStatus('denied');
      setValidationError(
        error instanceof Error 
          ? error.message 
          : 'Unable to detect your current location. Please enter your city manually.'
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const validateLocation = async (location: string) => {
    if (!location.trim()) {
      setWeatherPreview(null);
      setValidationError(null);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const weather = await WeatherService.getWeatherByCity(location);
      setWeatherPreview(weather);
      
      // If the city name changed (corrected by API), update the input
      if (weather.cityName !== location) {
        setLocationInput(weather.cityName);
      }
    } catch (error) {
      setValidationError('City not found. Please check the spelling and try again.');
      setWeatherPreview(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleLocationSubmit = async () => {
    const location = locationInput.trim();
    
    if (!location) {
      await onLocationChange(null);
      setWeatherPreview(null);
      return;
    }

    await validateLocation(location);
    if (!validationError) {
      await onLocationChange(location);
    }
  };

  const handleInputChange = (value: string) => {
    setLocationInput(value);
    setValidationError(null);
  };

  const getLocationStatusInfo = () => {
    switch (locationStatus) {
      case 'available':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Location access available'
        };
      case 'denied':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          text: 'Location access denied or blocked'
        };
      case 'unavailable':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Location services not supported'
        };
      default:
        return {
          icon: Info,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: 'Location status unknown'
        };
    }
  };

  const statusInfo = getLocationStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Location Status */}
      <Alert className={`${statusInfo.bgColor} ${statusInfo.borderColor}`}>
        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
        <AlertDescription className={statusInfo.color}>
          <div className="flex items-center justify-between">
            <span>{statusInfo.text}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkLocationPermission}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Auto-detect Location */}
      <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-500" />
            Auto-detect Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-600/80">
            Automatically detect your current location for accurate weather information.
          </p>
          
          <Button
            onClick={detectCurrentLocation}
            disabled={isDetecting || locationStatus === 'unavailable'}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detecting Location...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Detect My Location
              </>
            )}
          </Button>
          
          {locationStatus === 'denied' && (
            <p className="text-xs text-orange-600/80">
              💡 Tip: You can enable location access in your browser settings and try again.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Manual Location Entry */}
      <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Manual Location Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-input">City Name</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="location-input"
                  placeholder="Enter city name (e.g., New York, London, Tokyo)"
                  value={locationInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="glass-morandi border-white/30 focus:border-blue-400 rounded-xl pr-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleLocationSubmit()}
                />
                {isValidating && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                )}
              </div>
              <Button
                onClick={handleLocationSubmit}
                disabled={isValidating}
                variant="outline"
                className="rounded-xl px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {validationError && (
            <Alert className="border-red-200 bg-red-50/50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                {validationError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between text-sm text-blue-600/80">
            <span>Leave empty to disable weather display</span>
            {locationInput.trim() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocationInput('');
                  setWeatherPreview(null);
                  onLocationChange(null);
                }}
                className="h-6 px-2 text-xs text-blue-600/60 hover:text-blue-600"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weather Preview */}
      {weatherPreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-morandi border-green-200/50 bg-green-50/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Weather Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {weatherPreview.main === 'Clear' ? '☀️' :
                     weatherPreview.main === 'Clouds' ? '☁️' :
                     weatherPreview.main === 'Rain' ? '🌧️' :
                     weatherPreview.main === 'Snow' ? '❄️' : '🌊'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-800">{weatherPreview.temperature}°C</span>
                      <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-600/80 capitalize">{weatherPreview.description}</p>
                    <div className="flex items-center gap-1 text-xs text-blue-600/60 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{weatherPreview.cityName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}