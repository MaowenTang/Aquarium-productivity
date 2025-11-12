import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LocationManager } from './LocationManager';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Bell, 
  Volume2, 
  Trash2, 
  User, 
  Timer,
  Waves,
  Cloud,
  MapPin
} from 'lucide-react';
import { DataManager, UserSettings } from '../utils/DataManager';

interface SettingsProps {
  user: string;
  onLogout: () => void;
  onClearData: () => void;
}

export function Settings({ user, onLogout, onClearData }: SettingsProps) {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const { mode, oceanTheme, setMode, setOceanTheme } = useTheme();
  
  const [localPreferences, setLocalPreferences] = useState({
    notifications: true,
    dueTaskReminders: true,
    focusReminders: true,
    meditationReminders: true,
    focusDuration: 25,
    breakDuration: 5,
    soundVolume: 50
  });
  
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    loadUserSettings();
    checkConnection();
    loadLocalPreferences();
  }, []);

  const loadUserSettings = async () => {
    try {
      const settings = await dataManager.getUserSettings();
      setUserSettings(settings);
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  };

  const loadLocalPreferences = () => {
    // Load from localStorage for UI preferences only
    const stored = localStorage.getItem('aquarium_ui_preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse local preferences:', error);
      }
    }
  };

  const saveLocalPreference = (key: string, value: any) => {
    const updated = { ...localPreferences, [key]: value };
    setLocalPreferences(updated);
    
    // Save to localStorage for UI preferences
    localStorage.setItem('aquarium_ui_preferences', JSON.stringify(updated));
  };

  const checkConnection = async () => {
    const connected = await dataManager.testCloudConnection();
    setConnectionStatus(connected);
  };

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    try {
      await dataManager.updateUserSettings(updates);
      setUserSettings(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Failed to update user settings:', error);
      alert('❌ Failed to save settings. Please check your internet connection and try again.');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header with Cloud Status */}
      <Card className="backdrop-blur-sm border-2 border-blue-200 bg-blue-50/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            Settings & Cloud Sync
            <Badge variant="outline" className="ml-auto text-blue-700 border-blue-300">
              {connectionStatus ? '☁️ Connected' : '⚠️ Offline'}
            </Badge>
          </CardTitle>
          <p className="text-sm text-blue-700">
            All your data is securely stored in the cloud and synced across devices.
          </p>
        </CardHeader>
      </Card>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Cloud
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Profile Section */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌊</span>
                </div>
                <div>
                  <h3 className="font-medium">{user.split('@')[0]}</h3>
                  <p className="text-sm text-muted-foreground">{user}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Ocean Explorer</Badge>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      Cloud User
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={onLogout}
                  variant="outline"
                  className="flex-1 rounded-xl text-red-600 hover:text-red-700"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                Notifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Notification preferences are stored locally on this device.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Due Task Approaching - NEW */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Due Task Approaching</h4>
                    <p className="text-sm text-muted-foreground">Send a reminder when a task is getting close to its due time</p>
                  </div>
                  <Switch 
                    checked={localPreferences.dueTaskReminders} 
                    onCheckedChange={(value) => saveLocalPreference('dueTaskReminders', value)}
                  />
                </div>
                
                {/* Animated helper text - shows when toggle is ON */}
                <AnimatePresence>
                  {localPreferences.dueTaskReminders && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pl-0 pt-1">
                        <div className="px-3 py-2 rounded-lg bg-blue-50/50 border border-blue-200/50 backdrop-blur-sm">
                          <p className="text-xs text-blue-700">
                            <span className="font-medium">High priority:</span> 24h early • <span className="font-medium">Medium:</span> 12h early • <span className="font-medium">Low:</span> 8h early
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Focus Reminders</h4>
                  <p className="text-sm text-muted-foreground">Gentle nudges to start focus sessions</p>
                </div>
                <Switch 
                  checked={localPreferences.focusReminders} 
                  onCheckedChange={(value) => saveLocalPreference('focusReminders', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Meditation Reminders</h4>
                  <p className="text-sm text-muted-foreground">Daily mindfulness prompts</p>
                </div>
                <Switch 
                  checked={localPreferences.meditationReminders} 
                  onCheckedChange={(value) => saveLocalPreference('meditationReminders', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Focus Settings */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-purple-500" />
                Focus Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Focus Duration</h4>
                  <span className="text-sm text-blue-600">{localPreferences.focusDuration} minutes</span>
                </div>
                <Select 
                  value={localPreferences.focusDuration.toString()} 
                  onValueChange={(value) => saveLocalPreference('focusDuration', Number(value))}
                >
                  <SelectTrigger className="bg-white/50 border-white/30 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Break Duration</h4>
                  <span className="text-sm text-blue-600">{localPreferences.breakDuration} minutes</span>
                </div>
                <Select 
                  value={localPreferences.breakDuration.toString()} 
                  onValueChange={(value) => saveLocalPreference('breakDuration', Number(value))}
                >
                  <SelectTrigger className="bg-white/50 border-white/30 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sound Settings */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-cyan-500" />
                Audio & Sounds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Ocean Sounds Volume</h4>
                  <span className="text-sm text-blue-600">{localPreferences.soundVolume}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4 text-blue-500" />
                  <Slider
                    value={[localPreferences.soundVolume]}
                    onValueChange={(value) => saveLocalPreference('soundVolume', value[0])}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud" className="space-y-6">
          {/* Connection Status */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                Cloud Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Status</h4>
                  <p className="text-sm text-muted-foreground">Current connection to cloud services</p>
                </div>
                <Badge variant="outline" className={connectionStatus ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'}>
                  {connectionStatus ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              <Button 
                onClick={checkConnection}
                variant="outline"
                className="w-full rounded-xl"
              >
                Test Connection
              </Button>
            </CardContent>
          </Card>

          {/* Location Management */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Location & Weather Settings
              </CardTitle>
              <p className="text-sm text-blue-600/80">
                Configure your location for personalized weather display and activity recommendations
              </p>
            </CardHeader>
            <CardContent>
              <LocationManager
                currentLocation={userSettings?.location || null}
                onLocationChange={async (location) => {
                  await updateUserSettings({ location });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          {/* Dangerous Actions */}
          <Card className="backdrop-blur-sm border-2 border-red-200 bg-red-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <p className="text-sm text-red-600">
                Irreversible actions that permanently delete your cloud data.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-red-800">Clear All Cloud Data</h4>
                <p className="text-sm text-red-600">
                  This will permanently delete all your tasks, settings, and progress from the cloud. This action cannot be undone.
                </p>
                <Button 
                  onClick={onClearData}
                  variant="destructive"
                  className="w-full rounded-xl"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete All Cloud Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* App Info */}
      <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
        <CardContent className="pt-6 text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center mx-auto">
            <span className="text-xl">🌊</span>
          </div>
          <h3 className="font-medium">Aquarium Serenity</h3>
          <p className="text-sm text-muted-foreground">Version 2.0.0 • Cloud-First</p>
          <p className="text-xs text-blue-600">
            Peaceful productivity with seamless cloud sync
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Badge variant="outline" className="text-blue-700 border-blue-300 text-xs">
              Cloud Sync
            </Badge>
            <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
              Real-time
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}