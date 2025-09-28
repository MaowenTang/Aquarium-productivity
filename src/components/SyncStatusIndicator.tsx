import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, CloudOff, Wifi, WifiOff, Database, Smartphone } from 'lucide-react';
import { DataManager, SyncMode } from '../utils/DataManager';

interface SyncStatus {
  mode: SyncMode;
  online: boolean;
  connected: boolean;
}

interface SyncStatusIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  className?: string;
}

export function SyncStatusIndicator({ 
  position = 'top-right', 
  className = '' 
}: SyncStatusIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    mode: 'local-only',
    online: navigator.onLine,
    connected: false
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const dataManager = DataManager.getInstance();
    
    const updateStatus = () => {
      const status = dataManager.getSyncStatus();
      setSyncStatus(status);
    };

    // Initial status
    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update status periodically
    const interval = setInterval(updateStatus, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.mode === 'local-only') {
      return <Smartphone className="h-4 w-4" />;
    }
    
    if (!syncStatus.online) {
      return <WifiOff className="h-4 w-4" />;
    }
    
    if (syncStatus.connected) {
      return <Cloud className="h-4 w-4" />;
    }
    
    return <CloudOff className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (syncStatus.mode === 'local-only') {
      return 'text-blue-600 bg-blue-100';
    }
    
    if (!syncStatus.online) {
      return 'text-orange-600 bg-orange-100';
    }
    
    if (syncStatus.connected) {
      return 'text-green-600 bg-green-100';
    }
    
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = () => {
    if (syncStatus.mode === 'local-only') {
      return 'Local Only';
    }
    
    if (!syncStatus.online) {
      return 'Offline';
    }
    
    if (syncStatus.connected) {
      return 'Cloud Sync';
    }
    
    return 'Sync Error';
  };

  const getSyncAnimation = () => {
    if (syncStatus.mode === 'cloud-sync' && syncStatus.connected) {
      return {
        rotate: [0, 360],
        scale: [1, 1.1, 1]
      };
    }
    return {};
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      <motion.div
        className="relative"
        onHoverStart={() => setShowDetails(true)}
        onHoverEnd={() => setShowDetails(false)}
      >
        <motion.div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-full 
            glass-morandi border border-white/30 shadow-lg float-3d
            ${getStatusColor()} cursor-pointer
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={getSyncAnimation()}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <motion.div
            animate={syncStatus.mode === 'cloud-sync' && syncStatus.connected ? {
              rotate: [0, 180, 360]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getStatusIcon()}
          </motion.div>
          
          <span className="text-sm font-medium hidden sm:inline">
            {getStatusText()}
          </span>
          
          {/* Sync pulse animation */}
          {syncStatus.mode === 'cloud-sync' && syncStatus.connected && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-current opacity-30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Details tooltip */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className={`
                absolute ${position.includes('top') ? 'top-full mt-2' : 'bottom-full mb-2'}
                ${position.includes('right') ? 'right-0' : 'left-0'}
                w-64 p-4 glass-morandi border border-white/30 rounded-2xl shadow-xl float-3d
              `}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <h3 className="font-medium text-blue-800">{getStatusText()}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center justify-between">
                    <span>Storage Mode:</span>
                    <div className="flex items-center gap-1">
                      {syncStatus.mode === 'local-only' ? (
                        <>
                          <Database className="h-3 w-3" />
                          <span>Local Only</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="h-3 w-3" />
                          <span>Cloud Sync</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Network:</span>
                    <div className="flex items-center gap-1">
                      {syncStatus.online ? (
                        <>
                          <Wifi className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-600">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {syncStatus.mode === 'cloud-sync' && (
                    <div className="flex items-center justify-between">
                      <span>Database:</span>
                      <div className="flex items-center gap-1">
                        {syncStatus.connected ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-red-600">Disconnected</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 border-t border-white/20">
                  <p className="text-xs text-blue-600/80">
                    {syncStatus.mode === 'local-only' 
                      ? 'All data stored locally on your device'
                      : syncStatus.connected
                        ? 'Data synced with secure cloud storage'
                        : 'Cloud sync unavailable - using local storage'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}