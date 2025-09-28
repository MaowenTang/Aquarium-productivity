import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LocalDataVault } from './LocalDataVault';
import { PrivacyPanel } from './PrivacyPanel';
import { SecuritySettings } from './SecuritySettings';
import { 
  Palette, 
  Bell, 
  Volume2, 
  Download, 
  Trash2, 
  User, 
  Moon, 
  Sun,
  Timer,
  Brain,
  Waves,
  Shield,
  HardDrive,
  Lock,
  Eye
} from 'lucide-react';
import { LocalDataManager } from '../utils/LocalDataManager';

interface SettingsProps {
  user: string;
  onLogout: () => void;
  onClearData: () => void;
}

export function Settings({ user, onLogout, onClearData }: SettingsProps) {
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [preferences, setPreferences] = useState(() => LocalDataManager.loadPreferences());

  const updatePreference = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    LocalDataManager.savePreferences({ [key]: value });
  };

  const themes = [
    { id: 'ocean', name: 'Ocean Depths', description: 'Deep blue to light aqua gradient' },
    { id: 'coral', name: 'Coral Reef', description: 'Warm coral and pink tones' },
    { id: 'kelp', name: 'Kelp Forest', description: 'Green underwater garden' },
    { id: 'arctic', name: 'Arctic Waters', description: 'Cool cyan and white' },
  ];

  const dataSummary = LocalDataManager.getDataSummary();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header with Privacy Status */}
      <Card className="backdrop-blur-sm border-2 border-green-200 bg-green-50/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Settings & Privacy
            <Badge variant="outline" className="ml-auto text-green-700 border-green-300">
              {preferences.localOnlyMode ? '🔒 Local Only' : '☁️ Cloud Sync'}
            </Badge>
          </CardTitle>
          <p className="text-sm text-green-700">
            All your data stays on your device. No cloud sync, no telemetry, no external tracking.
          </p>
        </CardHeader>
      </Card>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
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
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {dataSummary.tasks} Tasks
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

          {/* Theme Settings */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-500" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Deep ocean theme</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <Switch 
                    checked={preferences.darkMode} 
                    onCheckedChange={(value) => updatePreference('darkMode', value)}
                  />
                  <Moon className="h-4 w-4 text-blue-500" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Ocean Theme</h4>
                <div className="grid grid-cols-1 gap-3">
                  {themes.map((themeOption) => (
                    <motion.div
                      key={themeOption.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${preferences.theme === themeOption.id 
                          ? 'border-blue-400 bg-blue-50/50' 
                          : 'border-white/30 bg-white/20 hover:bg-white/30'
                        }
                      `}
                      onClick={() => updatePreference('theme', themeOption.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{themeOption.name}</h5>
                          <p className="text-sm text-muted-foreground">{themeOption.description}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300" />
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                All notifications are processed locally and never shared externally.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">General app notifications</p>
                </div>
                <Switch 
                  checked={preferences.notifications} 
                  onCheckedChange={(value) => updatePreference('notifications', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Focus Reminders</h4>
                  <p className="text-sm text-muted-foreground">Gentle nudges to start focus sessions</p>
                </div>
                <Switch 
                  checked={preferences.focusReminders} 
                  onCheckedChange={(value) => updatePreference('focusReminders', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Meditation Reminders</h4>
                  <p className="text-sm text-muted-foreground">Daily mindfulness prompts</p>
                </div>
                <Switch 
                  checked={preferences.meditationReminders} 
                  onCheckedChange={(value) => updatePreference('meditationReminders', value)}
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
                  <span className="text-sm text-blue-600">{preferences.focusDuration} minutes</span>
                </div>
                <Select 
                  value={preferences.focusDuration.toString()} 
                  onValueChange={(value) => updatePreference('focusDuration', Number(value))}
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
                  <span className="text-sm text-blue-600">{preferences.breakDuration} minutes</span>
                </div>
                <Select 
                  value={preferences.breakDuration.toString()} 
                  onValueChange={(value) => updatePreference('breakDuration', Number(value))}
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
                  <span className="text-sm text-blue-600">{preferences.soundVolume}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4 text-blue-500" />
                  <Slider
                    value={[preferences.soundVolume]}
                    onValueChange={(value) => updatePreference('soundVolume', value[0])}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          {/* Local-Only Mode */}
          <Card className="backdrop-blur-sm border-2 border-green-200 bg-green-50/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Shield className="h-5 w-5" />
                Local-Only Mode
                <Badge variant="outline" className="ml-auto text-green-700 border-green-300">
                  {preferences.localOnlyMode ? 'ACTIVE' : 'DISABLED'}
                </Badge>
              </CardTitle>
              <p className="text-sm text-green-700">
                When enabled, no data leaves your device. No cloud sync, no telemetry, no external connections.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-800">Enable Local-Only Mode</h4>
                  <p className="text-sm text-green-600">
                    Prevents all external data transmission and keeps everything on your device
                  </p>
                </div>
                <Switch 
                  checked={preferences.localOnlyMode} 
                  onCheckedChange={(value) => updatePreference('localOnlyMode', value)}
                />
              </div>
              
              {preferences.localOnlyMode && (
                <div className="p-4 bg-green-100 rounded-xl">
                  <h5 className="font-medium text-green-800 mb-2">Local-Only Mode Active</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ All data stored locally on your device</li>
                    <li>✓ No cloud synchronization</li>
                    <li>✓ No usage analytics or telemetry</li>
                    <li>✓ Manual export/import only</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Overview */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Privacy Overview
                </div>
                <Button
                  onClick={() => setShowPrivacyPanel(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-lg font-bold text-green-600">{dataSummary.tasks}</div>
                  <div className="text-sm text-green-700">Local Tasks</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-lg font-bold text-blue-600">{dataSummary.storageSize}</div>
                  <div className="text-sm text-blue-700">Storage Used</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium">Data Status:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Local Storage</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cloud Sync</span>
                    <Badge variant="outline" className="text-gray-500 border-gray-300">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analytics</span>
                    <Badge variant="outline" className="text-gray-500 border-gray-300">None</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Third-party Tracking</span>
                    <Badge variant="outline" className="text-gray-500 border-gray-300">Blocked</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <LocalDataVault onDataChange={() => {/* Force refresh if needed */}} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings onSecurityChange={() => {/* Handle security changes */}} />
        </TabsContent>
      </Tabs>

      {/* Dangerous Actions */}
      <Card className="backdrop-blur-sm border-2 border-red-200 bg-red-50/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <p className="text-sm text-red-600">
            Irreversible actions that permanently delete your local data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-red-800">Clear All Local Data</h4>
            <p className="text-sm text-red-600">
              This will permanently delete all your tasks, settings, and progress from this device. This action cannot be undone.
            </p>
            <Button 
              onClick={onClearData}
              variant="destructive"
              className="w-full rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Permanently Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
        <CardContent className="pt-6 text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center mx-auto">
            <span className="text-xl">🌊</span>
          </div>
          <h3 className="font-medium">Aquarium Serenity</h3>
          <p className="text-sm text-muted-foreground">Version 1.0.0 • Privacy-First</p>
          <p className="text-xs text-blue-600">
            Peaceful productivity in your private digital ocean
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
              Local-Only
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-300 text-xs">
              No Tracking
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Panel */}
      <PrivacyPanel 
        isOpen={showPrivacyPanel} 
        onClose={() => setShowPrivacyPanel(false)} 
      />
    </div>
  );
}