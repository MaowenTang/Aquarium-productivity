import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Lock, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertTriangle,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { LocalDataManager } from '../utils/LocalDataManager';

interface SecuritySettingsProps {
  onSecurityChange?: () => void;
}

export function SecuritySettings({ onSecurityChange }: SecuritySettingsProps) {
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    // Load current security settings
    const preferences = LocalDataManager.loadPreferences();
    setAppLockEnabled(preferences.appLockEnabled);
    setBiometricEnabled(preferences.biometricEnabled);

    // Check for biometric support (simplified for demo)
    const checkBiometricSupport = () => {
      // In a real app, you'd check for WebAuthn or native biometric APIs
      const hasWebAuthn = 'credentials' in navigator && 'create' in navigator.credentials;
      const hasTouch = 'ontouchstart' in window;
      setBiometricSupported(hasWebAuthn || hasTouch);
    };

    checkBiometricSupport();
  }, []);

  const handleAppLockToggle = (enabled: boolean) => {
    if (enabled) {
      const confirmed = confirm(
        '🔒 ENABLE APP LOCK\n\n' +
        'This will require authentication every time you open the app.\n\n' +
        'Supported methods:\n' +
        '• Device passcode/PIN\n' +
        '• Biometric authentication (if available)\n\n' +
        'Enable app lock?'
      );
      
      if (confirmed) {
        setAppLockEnabled(true);
        LocalDataManager.savePreferences({ appLockEnabled: true });
        LocalDataManager.setAppLock(true);
        onSecurityChange?.();
      }
    } else {
      const confirmed = confirm(
        '🔓 DISABLE APP LOCK\n\n' +
        'This will remove authentication requirements.\n' +
        'Your data will still be stored locally and securely.\n\n' +
        'Disable app lock?'
      );
      
      if (confirmed) {
        setAppLockEnabled(false);
        setBiometricEnabled(false);
        LocalDataManager.savePreferences({ 
          appLockEnabled: false, 
          biometricEnabled: false 
        });
        LocalDataManager.setAppLock(false);
        onSecurityChange?.();
      }
    }
  };

  const handleBiometricToggle = (enabled: boolean) => {
    if (!biometricSupported) {
      alert('Biometric authentication is not available on this device.');
      return;
    }

    if (enabled && !appLockEnabled) {
      alert('Please enable App Lock first before configuring biometric authentication.');
      return;
    }

    setBiometricEnabled(enabled);
    LocalDataManager.savePreferences({ biometricEnabled: enabled });
    onSecurityChange?.();
  };

  const activatePanicHide = () => {
    setIsHidden(true);
    
    // In a real app, this would switch to a neutral/blank screen
    setTimeout(() => {
      const shouldReturn = confirm(
        'PRIVACY MODE ACTIVE\n\n' +
        'The app is now hidden behind a neutral screen.\n' +
        'Return to Aquarium Serenity?'
      );
      
      if (shouldReturn) {
        setIsHidden(false);
      }
    }, 1000);
  };

  const testBiometric = async () => {
    if (!biometricSupported) {
      alert('Biometric authentication not supported on this device.');
      return;
    }

    try {
      // Simplified biometric test (in real app, use WebAuthn or native APIs)
      const result = confirm(
        '👆 BIOMETRIC TEST\n\n' +
        'In a real implementation, this would prompt for:\n' +
        '• Fingerprint scan\n' +
        '• Face ID recognition\n' +
        '• Voice recognition\n\n' +
        'Simulate successful authentication?'
      );
      
      if (result) {
        alert('✅ Biometric authentication successful!');
      } else {
        alert('❌ Biometric authentication failed or cancelled.');
      }
    } catch (error) {
      console.error('Biometric test failed:', error);
      alert('❌ Biometric authentication error.');
    }
  };

  if (isHidden) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4 text-gray-400">
          <div className="text-6xl">📱</div>
          <h1 className="text-2xl font-light">Phone</h1>
          <p className="text-sm">No recent activity</p>
          <Button
            variant="ghost"
            onClick={() => setIsHidden(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            Tap to return
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* App Lock */}
      <Card className="glass-card-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            App Lock
            {appLockEnabled && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                Enabled
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Require authentication to access the app and your data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable App Lock</h4>
              <p className="text-sm text-muted-foreground">
                Protect your data with device authentication
              </p>
            </div>
            <Switch 
              checked={appLockEnabled} 
              onCheckedChange={handleAppLockToggle}
            />
          </div>

          {appLockEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                App lock is active. Your data is protected by device-level authentication.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Biometric Authentication */}
      <Card className="glass-card-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-purple-500" />
            Biometric Authentication
            {biometricEnabled && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                Enabled
              </Badge>
            )}
            {!biometricSupported && (
              <Badge variant="outline" className="text-gray-500 border-gray-300">
                Not Available
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use fingerprint, face ID, or other biometric methods for quick access.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Biometric Unlock</h4>
              <p className="text-sm text-muted-foreground">
                {biometricSupported 
                  ? 'Use your device biometrics for app access'
                  : 'Biometric authentication not supported on this device'
                }
              </p>
            </div>
            <Switch 
              checked={biometricEnabled} 
              onCheckedChange={handleBiometricToggle}
              disabled={!biometricSupported || !appLockEnabled}
            />
          </div>

          {biometricSupported && appLockEnabled && (
            <Button
              onClick={testBiometric}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              Test Biometric Authentication
            </Button>
          )}

          {!appLockEnabled && biometricSupported && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Enable App Lock first to use biometric authentication.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Privacy Features */}
      <Card className="glass-card-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-500" />
            Privacy Features
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick privacy controls for public spaces and unexpected interruptions.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border border-orange-200 rounded-xl bg-orange-50">
              <div className="flex items-start gap-3">
                <EyeOff className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-800">Quick Hide (Panic Mode)</h4>
                  <p className="text-sm text-orange-600 mb-3">
                    Instantly switch to a neutral screen when you need privacy in public spaces.
                  </p>
                  <Button
                    onClick={activatePanicHide}
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Activate Quick Hide
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-xl bg-blue-50">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">Device-Level Encryption</h4>
                  <p className="text-sm text-blue-600">
                    Your data benefits from your device's built-in encryption when supported by your operating system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Local-Only Storage</span>
              <Badge variant="outline" className="text-green-700 border-green-300">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">App Lock</span>
              <Badge 
                variant="outline" 
                className={appLockEnabled 
                  ? "text-green-700 border-green-300" 
                  : "text-gray-500 border-gray-300"
                }
              >
                {appLockEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Biometric Auth</span>
              <Badge 
                variant="outline" 
                className={biometricEnabled 
                  ? "text-green-700 border-green-300" 
                  : "text-gray-500 border-gray-300"
                }
              >
                {biometricEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Device Encryption</span>
              <Badge variant="outline" className="text-green-700 border-green-300">
                System-Level
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="glass-card-light">
        <CardHeader>
          <CardTitle className="text-blue-800">Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Enable app lock for additional security, especially on shared devices</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Create regular local backups of your data</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Use the quick hide feature in public spaces when needed</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Keep your device's operating system updated for latest security features</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}