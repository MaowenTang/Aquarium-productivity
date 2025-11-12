import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  Navigation, 
  Globe,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Loader2,
  Info,
  XCircle,
  MapPinOff
} from 'lucide-react';
import { WeatherService, WeatherData } from '../utils/weatherService';
import { useTheme } from '../contexts/ThemeContext';

interface LocationManagerProps {
  currentLocation: string | null;
  onLocationChange: (location: string | null) => Promise<void>;
}

type LocationStatus = 'unknown' | 'available' | 'denied' | 'blocked' | 'unavailable';
type DetectionState = 'idle' | 'loading' | 'success' | 'error';
type ValidationState = 'idle' | 'loading' | 'success' | 'error';

export function LocationManager({ currentLocation, onLocationChange }: LocationManagerProps) {
  const [locationInput, setLocationInput] = useState(currentLocation || '');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('unknown');
  const [detectionState, setDetectionState] = useState<DetectionState>('idle');
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [weatherPreview, setWeatherPreview] = useState<WeatherData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mode } = useTheme();

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
          setLocationStatus('blocked');
        } else {
          setLocationStatus('unknown');
        }
        
        // Listen for permission changes
        permission.addEventListener('change', () => {
          checkLocationPermission();
        });
      } else {
        setLocationStatus('unknown');
      }
    } catch {
      setLocationStatus('unknown');
    }
  };

  const detectCurrentLocation = async () => {
    setDetectionState('loading');
    setErrorMessage(null);

    try {
      const location = await WeatherService.getCurrentLocation();
      const weather = await WeatherService.getCurrentWeather(location.lat, location.lon);
      
      setLocationInput(weather.cityName);
      setWeatherPreview(weather);
      await onLocationChange(weather.cityName);
      setLocationStatus('available');
      setDetectionState('success');
      setValidationState('success');
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setDetectionState('idle');
      }, 3000);
      
    } catch (error) {
      console.log('Location detection failed:', error);
      
      // Determine if it's a permission issue or detection error
      if (error instanceof Error && error.message.includes('denied')) {
        setLocationStatus('denied');
        setErrorMessage('Location access was denied. Please enable it in your browser settings.');
      } else {
        setLocationStatus('denied');
        setErrorMessage('Unable to detect location. Please try again or enter manually.');
      }
      
      setDetectionState('error');
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        setDetectionState('idle');
      }, 5000);
    }
  };

  const validateLocation = async (location: string) => {
    if (!location.trim()) {
      setWeatherPreview(null);
      setErrorMessage(null);
      setValidationState('idle');
      return;
    }

    setValidationState('loading');
    setErrorMessage(null);

    try {
      const weather = await WeatherService.getWeatherByCity(location);
      setWeatherPreview(weather);
      setValidationState('success');
      
      // If the city name changed (corrected by API), update the input
      if (weather.cityName !== location) {
        setLocationInput(weather.cityName);
      }
    } catch (error) {
      setErrorMessage('City not found. Please check the spelling.');
      setWeatherPreview(null);
      setValidationState('error');
    }
  };

  const handleLocationSubmit = async () => {
    const location = locationInput.trim();
    
    if (!location) {
      await onLocationChange(null);
      setWeatherPreview(null);
      setValidationState('idle');
      return;
    }

    await validateLocation(location);
    if (weatherPreview) {
      await onLocationChange(location);
    }
  };

  const handleInputChange = (value: string) => {
    setLocationInput(value);
    setErrorMessage(null);
    if (validationState === 'error' || validationState === 'success') {
      setValidationState('idle');
    }
  };

  const handleClearLocation = () => {
    setLocationInput('');
    setWeatherPreview(null);
    setErrorMessage(null);
    setValidationState('idle');
    onLocationChange(null);
  };

  return (
    <div className="space-y-4">
      {/* Location Status Banner */}
      <LocationStatusBanner
        status={locationStatus}
        detectionState={detectionState}
        errorMessage={errorMessage}
        onRefresh={checkLocationPermission}
      />

      {/* Auto-detect Location Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="backdrop-blur-md border-2 shadow-lg overflow-hidden"
              style={{
                borderColor: 'var(--theme-borderSubtle)',
                background: 'var(--theme-surfaceBase)'
              }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4" style={{ color: 'var(--theme-accentPrimary)' }} />
              <span style={{ color: 'var(--theme-textPrimary)' }}>Auto-detect Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--theme-textSecondary)' }}>
              Automatically detect your current location for accurate weather information.
            </p>
            
            <DetectLocationButton
              state={detectionState}
              locationStatus={locationStatus}
              onDetect={detectCurrentLocation}
            />
            
            {/* Inline guidance when permission denied */}
            <AnimatePresence mode="wait">
              {(locationStatus === 'denied' || locationStatus === 'blocked') && detectionState === 'idle' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
                    border: '1px solid rgba(251, 146, 60, 0.2)'
                  }}
                >
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Please enable location access in your browser settings and try again. 
                    Look for the location icon in your browser's address bar.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Manual Location Entry Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="backdrop-blur-md border-2 shadow-lg overflow-hidden"
              style={{
                borderColor: 'var(--theme-borderSubtle)',
                background: 'var(--theme-surfaceBase)'
              }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" style={{ color: 'var(--theme-accentPrimary)' }} />
              <span style={{ color: 'var(--theme-textPrimary)' }}>Manual Location Entry</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="location-input" style={{ color: 'var(--theme-textSecondary)' }}>
                City Name
              </Label>
              <LocationInput
                value={locationInput}
                onChange={handleInputChange}
                onSubmit={handleLocationSubmit}
                state={validationState}
                errorMessage={errorMessage}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-textMuted)' }}>
              <span>Leave empty to disable weather display</span>
              <AnimatePresence>
                {locationInput.trim() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearLocation}
                      className="h-6 px-2 text-xs hover:bg-opacity-10 rounded-lg"
                      style={{ color: 'var(--theme-textMuted)' }}
                    >
                      Clear
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weather Preview with Success State */}
      <AnimatePresence mode="wait">
        {weatherPreview && validationState === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <Card className="overflow-hidden border-2 shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
                    borderColor: 'rgba(16, 185, 129, 0.3)'
                  }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <span className="text-green-800 dark:text-green-300">Location Connected</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="text-4xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {weatherPreview.main === 'Clear' ? '☀️' :
                     weatherPreview.main === 'Clouds' ? '☁️' :
                     weatherPreview.main === 'Rain' ? '🌧️' :
                     weatherPreview.main === 'Snow' ? '❄️' : '🌊'}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg text-green-900 dark:text-green-200">
                        {weatherPreview.temperature}°C
                      </span>
                      <Badge variant="outline" className="text-xs border-green-400 text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-900/30">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400 capitalize mb-1">
                      {weatherPreview.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
                      <MapPin className="h-3 w-3" />
                      <span>{weatherPreview.cityName}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Location Status Banner Component
interface LocationStatusBannerProps {
  status: LocationStatus;
  detectionState: DetectionState;
  errorMessage: string | null;
  onRefresh: () => void;
}

function LocationStatusBanner({ status, detectionState, errorMessage, onRefresh }: LocationStatusBannerProps) {
  const getStatusConfig = () => {
    if (detectionState === 'loading') {
      return {
        icon: Loader2,
        iconClass: 'animate-spin',
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%)',
        border: 'rgba(59, 130, 246, 0.3)',
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-800 dark:text-blue-200',
        text: 'Detecting your location...',
        showRefresh: false
      };
    }

    if (detectionState === 'success') {
      return {
        icon: CheckCircle,
        iconClass: '',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)',
        border: 'rgba(16, 185, 129, 0.3)',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-800 dark:text-green-200',
        text: 'Location detected successfully',
        showRefresh: false
      };
    }

    if (detectionState === 'error' && errorMessage) {
      return {
        icon: XCircle,
        iconClass: '',
        gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)',
        border: 'rgba(251, 146, 60, 0.3)',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-800 dark:text-amber-200',
        text: errorMessage,
        showRefresh: true
      };
    }

    switch (status) {
      case 'available':
        return {
          icon: CheckCircle,
          iconClass: '',
          gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)',
          border: 'rgba(16, 185, 129, 0.3)',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-800 dark:text-green-200',
          text: 'Location access available',
          showRefresh: false
        };
      case 'denied':
      case 'blocked':
        return {
          icon: MapPinOff,
          iconClass: '',
          gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)',
          border: 'rgba(251, 146, 60, 0.3)',
          iconColor: 'text-amber-600 dark:text-amber-400',
          textColor: 'text-amber-800 dark:text-amber-200',
          text: status === 'blocked' ? 'Location access blocked by browser' : 'Location access not granted',
          showRefresh: true
        };
      case 'unavailable':
        return {
          icon: AlertCircle,
          iconClass: '',
          gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.15) 100%)',
          border: 'rgba(239, 68, 68, 0.3)',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-800 dark:text-red-200',
          text: 'Location services not supported',
          showRefresh: false
        };
      default:
        return {
          icon: Info,
          iconClass: '',
          gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%)',
          border: 'rgba(59, 130, 246, 0.3)',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-800 dark:text-blue-200',
          text: 'Ready to detect location',
          showRefresh: true
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${status}-${detectionState}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="rounded-2xl p-4 backdrop-blur-sm border-2 shadow-lg"
        style={{
          background: config.gradient,
          borderColor: config.border
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <StatusIcon className={`h-5 w-5 ${config.iconColor} ${config.iconClass} flex-shrink-0`} />
            <p className={`text-sm font-medium ${config.textColor}`}>
              {config.text}
            </p>
          </div>
          {config.showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className={`h-7 w-7 p-0 rounded-lg ${config.textColor} hover:bg-black/5 dark:hover:bg-white/5`}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Detect Location Button Component
interface DetectLocationButtonProps {
  state: DetectionState;
  locationStatus: LocationStatus;
  onDetect: () => void;
}

function DetectLocationButton({ state, locationStatus, onDetect }: DetectLocationButtonProps) {
  const isDisabled = state === 'loading' || locationStatus === 'unavailable';

  const getButtonConfig = () => {
    switch (state) {
      case 'loading':
        return {
          icon: Loader2,
          iconClass: 'animate-spin',
          text: 'Detecting...',
          gradient: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
          className: 'cursor-wait'
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconClass: '',
          text: 'Location Detected',
          gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          className: ''
        };
      case 'error':
        return {
          icon: RefreshCw,
          iconClass: '',
          text: 'Try Again',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          className: ''
        };
      default:
        return {
          icon: Navigation,
          iconClass: '',
          text: 'Detect My Location',
          gradient: 'var(--theme-gradientPrimary)',
          className: ''
        };
    }
  };

  const config = getButtonConfig();
  const ButtonIcon = config.icon;

  return (
    <motion.div whileTap={{ scale: isDisabled ? 1 : 0.98 }}>
      <Button
        onClick={onDetect}
        disabled={isDisabled}
        className={`w-full rounded-xl text-white shadow-lg transition-all ${config.className}`}
        style={{
          background: isDisabled ? 'rgba(156, 163, 175, 0.5)' : config.gradient
        }}
      >
        <motion.div
          animate={state === 'success' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ButtonIcon className={`h-4 w-4 mr-2 ${config.iconClass}`} />
        </motion.div>
        {config.text}
      </Button>
    </motion.div>
  );
}

// Location Input Component
interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  state: ValidationState;
  errorMessage: string | null;
}

function LocationInput({ value, onChange, onSubmit, state, errorMessage }: LocationInputProps) {
  const getBorderColor = () => {
    switch (state) {
      case 'success':
        return 'rgba(16, 185, 129, 0.5)';
      case 'error':
        return 'rgba(251, 146, 60, 0.5)';
      case 'loading':
        return 'rgba(59, 130, 246, 0.5)';
      default:
        return 'var(--theme-border)';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="location-input"
            placeholder="e.g., New York, London, Tokyo"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-xl pr-10 transition-all backdrop-blur-sm"
            style={{
              borderColor: getBorderColor(),
              borderWidth: '2px',
              background: 'var(--theme-glassBackground)'
            }}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
          <AnimatePresence mode="wait">
            {state === 'loading' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </motion.div>
            )}
            {state === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </motion.div>
            )}
            {state === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <XCircle className="h-4 w-4 text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          onClick={onSubmit}
          disabled={state === 'loading'}
          className="rounded-xl px-4 shadow-md"
          style={{
            background: 'var(--theme-gradientPrimary)',
            color: 'white'
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Error message */}
      <AnimatePresence mode="wait">
        {state === 'error' && errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 p-2.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
              border: '1px solid rgba(251, 146, 60, 0.2)'
            }}
          >
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {errorMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
