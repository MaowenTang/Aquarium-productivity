import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Shield, 
  HardDrive, 
  Eye, 
  Lock, 
  Download,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { LocalDataManager } from '../utils/LocalDataManager';

interface PrivacyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPanel({ isOpen, onClose }: PrivacyPanelProps) {
  const dataSummary = LocalDataManager.getDataSummary();
  const storageInfo = LocalDataManager.getStorageInfo();

  const downloadPrivacySummary = () => {
    const summary = `
AQUARIUM SERENITY - PRIVACY SUMMARY
Generated: ${new Date().toLocaleDateString()}

=== DATA HANDLING PRINCIPLES ===

✓ LOCAL-FIRST ARCHITECTURE
All your data stays on your device. We never upload, sync, or transmit your personal information to any servers.

✓ NO TELEMETRY OR ANALYTICS
We don't track your usage, collect analytics, or monitor your behavior in any way.

✓ NO THIRD-PARTY INTEGRATIONS
No advertising networks, social media trackers, or external analytics services are integrated into this app.

✓ TRANSPARENT DATA STORAGE
All data is stored locally in your browser's storage or device file system.

=== WHAT WE STORE (ON YOUR DEVICE ONLY) ===

• Tasks and Schedules: ${dataSummary.tasks} tasks
• Focus Sessions: ${dataSummary.focusSessions} completed sessions
• Meditation Records: ${dataSummary.meditationSessions} sessions
• App Preferences: Theme, notification settings, timer durations
• Total Storage Used: ${dataSummary.storageSize}

=== WHAT WE NEVER COLLECT ===

✗ Personal identity information
✗ Contact lists or phonebook data
✗ Location data or GPS coordinates
✗ Device identifiers or fingerprinting
✗ Usage analytics or behavioral tracking
✗ Advertising data or marketing profiles
✗ Third-party account connections

=== YOUR CONTROL ===

• View all stored data through the Local Data Vault
• Export your data at any time in standard formats
• Delete all data permanently with one click
• No account deletion needed - just remove the app

=== SECURITY FEATURES ===

• Optional biometric/passcode app lock
• Local encryption where supported by your device
• Quick hide feature for privacy in public spaces
• Manual backup and restore to your chosen location

=== DATA RETENTION ===

We don't have access to your data, so we can't retain it. Your data exists only on your device for as long as you keep the app installed. Uninstalling the app removes all data permanently.

=== CONTACT ===

This app operates entirely offline. For technical questions about privacy features, consult the in-app help documentation.

Last Updated: ${new Date().toLocaleDateString()}
Privacy Policy Version: 1.0
`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquarium-serenity-privacy-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-4xl w-full max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Privacy & Data Transparency</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Privacy Principles */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                Our Privacy Principles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <HardDrive className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">Local-First Architecture</h4>
                    <p className="text-sm text-green-700">All data stays on your device. No cloud storage, no servers.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">Zero Telemetry</h4>
                    <p className="text-sm text-green-700">No usage tracking, analytics, or behavioral monitoring.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">Your Control</h4>
                    <p className="text-sm text-green-700">View, export, or delete all your data at any time.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">Transparent</h4>
                    <p className="text-sm text-green-700">Open source approach to data handling and privacy.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We Store */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800">What We Store (On Your Device Only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{dataSummary.tasks}</div>
                  <div className="text-sm text-blue-700">Tasks</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{dataSummary.focusSessions}</div>
                  <div className="text-sm text-purple-700">Focus Sessions</div>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-600">{dataSummary.meditationSessions}</div>
                  <div className="text-sm text-cyan-700">Meditation Records</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-600">{dataSummary.storageSize}</div>
                  <div className="text-sm text-gray-700">Storage Used</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Stored Data Types:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <span>• Tasks and schedules</span>
                  <span>• Focus session history</span>
                  <span>• Meditation preferences</span>
                  <span>• App settings and themes</span>
                  <span>• Timer configurations</span>
                  <span>• Local backups (if created)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We Never Collect */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                What We Never Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-700">
                <span>✗ Personal identity information</span>
                <span>✗ Contact lists or phonebook</span>
                <span>✗ Location data or GPS coordinates</span>
                <span>✗ Device identifiers or fingerprinting</span>
                <span>✗ Usage analytics or tracking</span>
                <span>✗ Advertising or marketing data</span>
                <span>✗ Third-party account connections</span>
                <span>✗ Social media integration data</span>
              </div>
            </CardContent>
          </Card>

          {/* Storage Location */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Location & Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl font-mono text-sm">
                <div className="font-semibold mb-2">Local Storage Structure:</div>
                <div className="space-y-1 text-gray-600">
                  <div>/AquariumSerenity/</div>
                  <div className="ml-4">├── tasks.json ({storageInfo.items.find(i => i.key.includes('tasks'))?.size || 0} bytes)</div>
                  <div className="ml-4">├── preferences.json ({storageInfo.items.find(i => i.key.includes('preferences'))?.size || 0} bytes)</div>
                  <div className="ml-4">├── focus-sessions.json ({storageInfo.items.find(i => i.key.includes('focus'))?.size || 0} bytes)</div>
                  <div className="ml-4">├── meditation-history.json ({storageInfo.items.find(i => i.key.includes('meditation'))?.size || 0} bytes)</div>
                  <div className="ml-4">└── app-state.json</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Browser Local Storage
                </Badge>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {dataSummary.storageSize} Total
                </Badge>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  {storageInfo.itemCount} Data Files
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>How to Manage Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-blue-200 rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-2">View Your Data</h4>
                  <p className="text-sm text-blue-600 mb-3">Access the Local Data Vault in Settings to see all stored information.</p>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">Settings → Data</Badge>
                </div>
                
                <div className="p-4 border border-green-200 rounded-xl">
                  <h4 className="font-medium text-green-800 mb-2">Export Your Data</h4>
                  <p className="text-sm text-green-600 mb-3">Download your data in standard JSON format for backup or migration.</p>
                  <Badge variant="outline" className="text-green-700 border-green-300">Manual Export Only</Badge>
                </div>
                
                <div className="p-4 border border-red-200 rounded-xl">
                  <h4 className="font-medium text-red-800 mb-2">Delete Everything</h4>
                  <p className="text-sm text-red-600 mb-3">Permanently remove all data from your device with confirmation.</p>
                  <Badge variant="outline" className="text-red-700 border-red-300">Settings → Clear Data</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()} • Privacy Policy v1.0
            </div>
            <Button
              onClick={downloadPrivacySummary}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Privacy Summary
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}