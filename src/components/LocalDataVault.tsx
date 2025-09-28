import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  HardDrive, 
  FolderOpen, 
  Download, 
  Upload, 
  Trash2, 
  Shield,
  FileText,
  Archive,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { LocalDataManager } from '../utils/LocalDataManager';
import { Task } from '../types/Task';

interface LocalDataVaultProps {
  onDataChange?: () => void;
}

export function LocalDataVault({ onDataChange }: LocalDataVaultProps) {
  const [backupStatus, setBackupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const dataSummary = LocalDataManager.getDataSummary();
  const storageInfo = LocalDataManager.getStorageInfo();
  const preferences = LocalDataManager.loadPreferences();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createLocalBackup = async () => {
    setBackupStatus('creating');
    try {
      const backup = LocalDataManager.createBackup();
      const url = URL.createObjectURL(backup);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aquarium-serenity-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setBackupStatus('success');
      setLastAction(`Backup created: ${new Date().toLocaleString()}`);
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch (error) {
      console.error('[Privacy] Backup failed:', error);
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  const restoreFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImportStatus('importing');
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validate data structure
        if (!data.tasks && !data.preferences && !data.focusSessions) {
          throw new Error('Invalid backup file format');
        }

        const confirmed = confirm(
          `Import data from backup?\n\n` +
          `This will replace your current data with:\n` +
          `• ${data.tasks?.length || 0} tasks\n` +
          `• ${data.focusSessions?.length || 0} focus sessions\n` +
          `• ${data.meditationSessions?.length || 0} meditation sessions\n\n` +
          `Current data will be overwritten. Continue?`
        );

        if (confirmed) {
          LocalDataManager.importAllData(data);
          setImportStatus('success');
          setLastAction(`Data imported: ${new Date().toLocaleString()}`);
          onDataChange?.();
        } else {
          setImportStatus('idle');
        }
        
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch (error) {
        console.error('[Privacy] Import failed:', error);
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    input.click();
  };

  const exportTasksOnly = () => {
    const tasks = LocalDataManager.loadTasks();
    const exportData = {
      tasks,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquarium-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setLastAction(`Tasks exported: ${new Date().toLocaleString()}`);
  };

  const exportAllData = () => {
    const confirmed = confirm(
      '📁 EXPORT ALL DATA\n\n' +
      'This will download a complete backup of all your data including:\n' +
      '• All tasks and schedules\n' +
      '• Focus session history\n' +
      '• Meditation records\n' +
      '• App preferences\n\n' +
      'The file will be saved to your Downloads folder.\n\n' +
      'Continue?'
    );

    if (confirmed) {
      createLocalBackup();
    }
  };

  const previewData = () => {
    const allData = LocalDataManager.exportAllData();
    return {
      ...allData,
      tasks: allData.tasks.slice(0, 3), // Show only first 3 for preview
      focusSessions: allData.focusSessions.slice(0, 3),
      meditationSessions: allData.meditationSessions.slice(0, 3)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header with Local-Only Status */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            Local Data Vault
            <Badge variant="outline" className="ml-auto text-green-700 border-green-300">
              {preferences.localOnlyMode ? 'Local Only ✓' : 'Cloud Sync Disabled'}
            </Badge>
          </CardTitle>
          <p className="text-sm text-green-700">
            All your data is stored securely on your device. No cloud sync, no external servers.
          </p>
        </CardHeader>
      </Card>

      {/* Storage Overview */}
      <Card className="glass-card-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-blue-500" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-xl font-bold text-blue-600">{dataSummary.tasks}</div>
              <div className="text-sm text-blue-700">Tasks</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <div className="text-xl font-bold text-purple-600">{dataSummary.focusSessions}</div>
              <div className="text-sm text-purple-700">Focus Sessions</div>
            </div>
            <div className="text-center p-3 bg-cyan-50 rounded-xl">
              <div className="text-xl font-bold text-cyan-600">{dataSummary.meditationSessions}</div>
              <div className="text-sm text-cyan-700">Meditations</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-xl font-bold text-gray-600">{dataSummary.storageSize}</div>
              <div className="text-sm text-gray-700">Storage Used</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Utilization</span>
              <span>{formatBytes(storageInfo.totalSize)}</span>
            </div>
            <Progress value={Math.min((storageInfo.totalSize / 1024) * 10, 100)} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Browser storage limit varies by device and browser
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Structure Preview */}
      <Card className="glass-card-light">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-orange-500" />
              Local Storage Structure
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDataPreview(!showDataPreview)}
              className="gap-2"
            >
              {showDataPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDataPreview ? 'Hide' : 'Preview'} Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-xl font-mono text-sm">
            <div className="space-y-1 text-gray-600">
              <div className="text-gray-800 font-semibold">/AquariumSerenity/</div>
              <div className="ml-4">├── 📋 tasks.json ({storageInfo.items.find(i => i.key.includes('tasks'))?.size || 0} bytes)</div>
              <div className="ml-4">├── ⚙️ preferences.json ({storageInfo.items.find(i => i.key.includes('preferences'))?.size || 0} bytes)</div>
              <div className="ml-4">├── 🎯 focus-sessions.json ({storageInfo.items.find(i => i.key.includes('focus'))?.size || 0} bytes)</div>
              <div className="ml-4">├── 🧘 meditation-history.json ({storageInfo.items.find(i => i.key.includes('meditation'))?.size || 0} bytes)</div>
              <div className="ml-4">└── 🔒 app-state.json</div>
            </div>
          </div>

          {showDataPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-blue-50 rounded-xl"
            >
              <h4 className="font-medium mb-2 text-blue-800">Data Preview (First 3 Items)</h4>
              <pre className="text-xs text-blue-700 overflow-auto max-h-40">
                {JSON.stringify(previewData(), null, 2)}
              </pre>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card className="glass-card-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-green-500" />
            Backup & Restore
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create local backups or restore from previous backups. All operations are manual and require your confirmation.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataSummary.lastBackup && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Last backup created: {new Date(dataSummary.lastBackup).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={createLocalBackup}
              disabled={backupStatus === 'creating'}
              className="h-16 flex-col gap-2 bg-green-500 hover:bg-green-600"
            >
              {backupStatus === 'creating' ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <span>Create Local Backup</span>
            </Button>

            <Button
              onClick={restoreFromFile}
              disabled={importStatus === 'importing'}
              variant="outline"
              className="h-16 flex-col gap-2"
            >
              {importStatus === 'importing' ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span>Restore from File</span>
            </Button>
          </div>

          {(backupStatus === 'success' || importStatus === 'success') && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Operation completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {(backupStatus === 'error' || importStatus === 'error') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Operation failed. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Manual Import/Export */}
      <Card className="glass-card-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Manual Import/Export
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Export specific data types or complete data sets. Each action requires explicit confirmation.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={exportTasksOnly}
              variant="outline"
              className="h-16 flex-col gap-2"
            >
              <FileText className="h-5 w-5" />
              <span>Export Tasks Only</span>
            </Button>

            <Button
              onClick={exportAllData}
              variant="outline"
              className="h-16 flex-col gap-2"
            >
              <Archive className="h-5 w-5" />
              <span>Export All Data</span>
            </Button>
          </div>

          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Note:</strong> All exports are manual operations that require your explicit confirmation. 
              No automatic syncing or uploading occurs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Activity Log */}
      {lastAction && (
        <Card className="glass-card-light">
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {lastAction}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}