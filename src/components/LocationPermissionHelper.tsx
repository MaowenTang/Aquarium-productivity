import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { 
  MapPin, 
  X, 
  Info,
  Settings as SettingsIcon,
  RefreshCw
} from 'lucide-react';

interface LocationPermissionHelperProps {
  show: boolean;
  onDismiss: () => void;
  onTryAgain?: () => void;
}

export function LocationPermissionHelper({ 
  show, 
  onDismiss, 
  onTryAgain 
}: LocationPermissionHelperProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(onDismiss, 300); // Allow animation to complete
  };

  const getBrowserSpecificInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return "Click the location icon in your address bar and select 'Allow'";
    } else if (userAgent.includes('firefox')) {
      return "Click the shield icon in your address bar and enable location access";
    } else if (userAgent.includes('safari')) {
      return "Go to Safari > Settings > Websites > Location and allow access";
    } else if (userAgent.includes('edge')) {
      return "Click the location icon in your address bar and select 'Allow'";
    }
    
    return "Check your browser settings to enable location access for this site";
  };

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Alert className="glass-morandi border-blue-200/50 bg-blue-50/80 shadow-xl float-3d">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <AlertDescription className="text-blue-800">
                  <div className="space-y-2">
                    <p className="font-medium">Location Access Unavailable</p>
                    <p className="text-sm text-blue-700">
                      To get weather for your area, please enable location access in your browser.
                    </p>
                    
                    <div className="bg-blue-100/50 rounded-lg p-2 mt-2">
                      <p className="text-xs text-blue-600">
                        <SettingsIcon className="h-3 w-3 inline mr-1" />
                        {getBrowserSpecificInstructions()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {onTryAgain && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onTryAgain}
                          className="text-xs bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Try Again
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDismiss}
                        className="text-xs text-blue-600 hover:bg-blue-100"
                      >
                        Got it
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}