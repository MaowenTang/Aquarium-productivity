import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  HardDrive, 
  Cloud, 
  Wifi, 
  WifiOff,
  Shield,
  Database,
  Smartphone,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { SyncMode } from '../utils/DataManager';

interface StorageModeSelectorProps {
  currentMode: SyncMode;
  isOnline: boolean;
  isChanging: boolean;
  onModeChange: (mode: SyncMode) => Promise<void>;
  cloudConnectionStatus: boolean;
}

export function StorageModeSelector({ 
  currentMode, 
  isOnline, 
  isChanging, 
  onModeChange,
  cloudConnectionStatus 
}: StorageModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<SyncMode>(currentMode);

  const handleModeSelect = async (mode: SyncMode) => {
    if (mode === currentMode || isChanging) return;
    
    setSelectedMode(mode);
    await onModeChange(mode);
  };

  const modeConfigs = {
    'local-only': {
      title: 'Local Only',
      subtitle: 'Privacy First',
      description: 'All data stays on your device. No cloud connection required.',
      icon: HardDrive,
      benefits: [
        'Complete privacy - data never leaves your device',
        'Works offline always',
        'No account or internet required',
        'Instant access and performance'
      ],
      limitations: [
        'No sync between devices', 
        'No automatic backup',
        'Data lost if device is damaged'
      ],
      badge: { text: 'Private', color: 'bg-green-500' },
      gradient: 'from-green-400/20 to-emerald-500/20',
      borderColor: 'border-green-300/40'
    },
    'cloud-sync': {
      title: 'Cloud Sync',
      subtitle: 'Multi-Device',
      description: 'Secure cloud backup with real-time sync across all your devices.',
      icon: Cloud,
      benefits: [
        'Sync across all devices',
        'Automatic secure backup',
        'Real-time updates',
        'Never lose your data'
      ],
      limitations: [
        'Requires internet connection',
        'Data stored in secure cloud',
        'Slight sync delays possible'  
      ],
      badge: { text: 'Synced', color: 'bg-blue-500' },
      gradient: 'from-blue-400/20 to-cyan-500/20',
      borderColor: 'border-blue-300/40'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-medium text-ocean-deep">Data Storage Preference</h3>
        <p className="text-ocean-dark/70">Choose how your data is stored and synchronized</p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-sm text-ocean-dark">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-ocean-dark">Offline</span>
          </>
        )}
        
        {currentMode === 'cloud-sync' && (
          <>
            <span className="text-ocean-dark/50">•</span>
            {cloudConnectionStatus ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-ocean-dark">Cloud Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-ocean-dark">Cloud Disconnected</span>
              </>
            )}
          </>
        )}
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(modeConfigs).map(([mode, config]) => {
          const Icon = config.icon;
          const isSelected = mode === currentMode;
          const isSelecting = selectedMode === mode && isChanging;
          
          return (
            <motion.div
              key={mode}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`
                  relative cursor-pointer transition-all duration-300 glass-morandi
                  ${isSelected ? `ring-2 ring-blue-400 ${config.gradient} ${config.borderColor}` : 'hover:shadow-lg'}
                  ${isChanging && !isSelecting ? 'opacity-50' : ''}
                `}
                onClick={() => handleModeSelect(mode as SyncMode)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-xl bg-gradient-to-br ${config.gradient}
                        ${isSelected ? 'ring-2 ring-white/40' : ''}
                      `}>
                        <Icon className="w-6 h-6 text-ocean-deep" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{config.title}</CardTitle>
                          <Badge className={`${config.badge.color} text-white text-xs`}>
                            {config.badge.text}
                          </Badge>
                        </div>
                        <p className="text-sm text-ocean-dark/70 font-medium">{config.subtitle}</p>
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    <div className="flex items-center gap-2">
                      {isSelecting && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                      <div className={`
                        w-5 h-5 rounded-full border-2 transition-all
                        ${isSelected 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300 hover:border-blue-400'
                        }
                      `}>
                        {isSelected && (
                          <CheckCircle className="w-3 h-3 text-white m-0.5" fill="currentColor" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-ocean-dark/80">{config.description}</p>
                  
                  {/* Benefits */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-ocean-deep flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Benefits
                    </h4>
                    <ul className="space-y-1">
                      {config.benefits.map((benefit, index) => (
                        <li key={index} className="text-xs text-ocean-dark/70 flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Limitations */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-ocean-deep flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-orange-500" />
                      Considerations
                    </h4>
                    <ul className="space-y-1">
                      {config.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-ocean-dark/70 flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Switch Toggle */}
      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              {currentMode === 'local-only' ? (
                <HardDrive className="w-4 h-4 text-ocean-deep" />
              ) : (
                <Cloud className="w-4 h-4 text-ocean-deep" />
              )}
            </div>
            <div>
              <p className="font-medium text-ocean-deep">
                Quick Toggle: {currentMode === 'local-only' ? 'Local Only' : 'Cloud Sync'}
              </p>
              <p className="text-xs text-ocean-dark/70">
                Switch between storage modes instantly
              </p>
            </div>
          </div>
          
          <Switch
            checked={currentMode === 'cloud-sync'}
            onCheckedChange={(checked) => 
              handleModeSelect(checked ? 'cloud-sync' : 'local-only')
            }
            disabled={isChanging}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>

      {/* Migration Status */}
      {isChanging && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">
                {selectedMode === 'cloud-sync' ? 'Migrating to Cloud Sync...' : 'Switching to Local Only...'}
              </p>
              <p className="text-sm text-blue-600/80">
                {selectedMode === 'cloud-sync' 
                  ? 'Uploading your data securely to the cloud' 
                  : 'Downloading your data for local storage'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}