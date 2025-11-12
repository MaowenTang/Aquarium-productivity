import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Database,
  Cloud,
  Smartphone,
  Loader2,
  Info
} from 'lucide-react';
import { DataManager, SyncMode } from '../utils/DataManager';
import { LocalDataManager } from '../utils/LocalDataManager';

interface DataMigrationPanelProps {
  currentMode: SyncMode;
  onModeChange: (mode: SyncMode) => Promise<void>;
}

interface MigrationStatus {
  isActive: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  errors: string[];
  completed: boolean;
}

export function DataMigrationPanel({ currentMode, onModeChange }: DataMigrationPanelProps) {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    isActive: false,
    progress: 0,
    currentStep: '',
    totalSteps: 0,
    errors: [],
    completed: false
  });
  
  const [dataSummary, setDataSummary] = useState(() => LocalDataManager.getDataSummary());
  
  const dataManager = DataManager.getInstance();

  const updateDataSummary = () => {
    setDataSummary(LocalDataManager.getDataSummary());
  };

  const simulateMigrationProgress = (targetMode: SyncMode) => {
    return new Promise<void>((resolve, reject) => {
      const steps = targetMode === 'cloud-sync' 
        ? ['Preparing data', 'Validating integrity', 'Uploading tasks', 'Uploading settings', 'Syncing metadata', 'Finalizing']
        : ['Connecting to cloud', 'Downloading tasks', 'Downloading settings', 'Validating data', 'Saving locally', 'Finalizing'];
      
      let currentStepIndex = 0;
      const totalSteps = steps.length;
      
      setMigrationStatus({
        isActive: true,
        progress: 0,
        currentStep: steps[0],
        totalSteps,
        errors: [],
        completed: false
      });
      
      const progressInterval = setInterval(() => {
        const stepProgress = (currentStepIndex + 1) / totalSteps * 100;
        
        setMigrationStatus(prev => ({
          ...prev,
          progress: stepProgress,
          currentStep: steps[currentStepIndex] || 'Completing...'
        }));
        
        currentStepIndex++;
        
        if (currentStepIndex >= totalSteps) {
          clearInterval(progressInterval);
          setMigrationStatus(prev => ({
            ...prev,
            completed: true,
            isActive: false,
            progress: 100,
            currentStep: 'Migration completed successfully!'
          }));
          setTimeout(() => {
            updateDataSummary();
            resolve();
          }, 1000);
        }
      }, 800);
    });
  };

  const handleMigration = async (targetMode: SyncMode) => {
    try {
      // Start progress simulation
      const progressPromise = simulateMigrationProgress(targetMode);
      
      // Actual migration
      const migrationPromise = onModeChange(targetMode);
      
      // Wait for both to complete
      await Promise.all([progressPromise, migrationPromise]);
      
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus(prev => ({
        ...prev,
        isActive: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Migration failed']
      }));
    }
  };

  const getMigrationDescription = (targetMode: SyncMode) => {
    if (targetMode === 'cloud-sync') {
      return {
        title: 'Migrate to Cloud Sync',
        description: 'Upload your local data to secure cloud storage and enable sync across devices',
        benefits: [
          'Access your data from any device',
          'Automatic backup and recovery',
          'Real-time synchronization',
          'Never lose your progress'
        ],
        risks: [
          'Requires stable internet connection',
          'Data temporarily duplicated during migration',
          'Slight performance impact during sync'
        ]
      };
    } else {
      return {
        title: 'Switch to Local Only',
        description: 'Download your cloud data locally and disable cloud synchronization',
        benefits: [
          'Complete data privacy and control',
          'No internet dependency',
          'Faster performance',
          'Full offline access'
        ],
        risks: [
          'No sync between devices',
          'No automatic backup',
          'Data lost if device is damaged'
        ]
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Data Summary */}
      <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Current Data Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-xl bg-white/10">
              <div className="text-2xl font-medium text-blue-600">{dataSummary.tasks}</div>
              <div className="text-sm text-blue-600/70">Tasks</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/10">
              <div className="text-2xl font-medium text-blue-600">{dataSummary.completedTasks}</div>
              <div className="text-sm text-blue-600/70">Completed</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/10">
              <div className="text-2xl font-medium text-blue-600">{dataSummary.focusSessions}</div>
              <div className="text-sm text-blue-600/70">Focus Sessions</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/10">
              <div className="text-2xl font-medium text-blue-600">{(dataSummary.dataSize / 1024).toFixed(1)}KB</div>
              <div className="text-sm text-blue-600/70">Data Size</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="outline" className={currentMode === 'local-only' ? 'border-green-400 text-green-700' : 'border-blue-400 text-blue-700'}>
              {currentMode === 'local-only' ? (
                <>
                  <Smartphone className="h-3 w-3 mr-1" />
                  Local Only Mode
                </>
              ) : (
                <>
                  <Cloud className="h-3 w-3 mr-1" />
                  Cloud Sync Mode
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Migration Options */}
      {['local-only', 'cloud-sync'].map((mode) => {
        if (mode === currentMode) return null;
        
        const targetMode = mode as SyncMode;
        const config = getMigrationDescription(targetMode);
        
        return (
          <Card key={mode} className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {targetMode === 'cloud-sync' ? (
                  <>
                    <Upload className="h-5 w-5 text-blue-500" />
                    {config.title}
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 text-green-500" />
                    {config.title}
                  </>
                )}
              </CardTitle>
              <p className="text-sm text-blue-600/80">{config.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Benefits & Risks */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-medium text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Benefits
                  </h4>
                  <ul className="space-y-2">
                    {config.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        <span className="text-blue-600/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-medium text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    Considerations
                  </h4>
                  <ul className="space-y-2">
                    {config.risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-1 h-1 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span className="text-blue-600/80">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Migration Button */}
              <div className="pt-4 border-t border-white/20">
                <Button
                  onClick={() => handleMigration(targetMode)}
                  disabled={migrationStatus.isActive}
                  className={`w-full rounded-xl ${
                    targetMode === 'cloud-sync' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {migrationStatus.isActive ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      {targetMode === 'cloud-sync' ? 'Migrate to Cloud' : 'Switch to Local'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Migration Progress */}
      {migrationStatus.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 z-50"
        >
          <Card className="backdrop-blur-sm border-2 border-blue-200 bg-blue-50/50 shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-blue-800">Migration in Progress</h3>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    {migrationStatus.progress.toFixed(0)}%
                  </Badge>
                </div>
                
                <Progress value={migrationStatus.progress} className="h-2" />
                
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{migrationStatus.currentStep}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Migration Complete */}
      {migrationStatus.completed && !migrationStatus.isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert className="border-green-200 bg-green-50/50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Migration completed successfully! Your data is now {currentMode === 'cloud-sync' ? 'synced with the cloud' : 'stored locally'}.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Migration Errors */}
      {migrationStatus.errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50/50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Migration encountered issues: {migrationStatus.errors.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Information */}
      <Alert className="border-blue-200 bg-blue-50/50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Safe Migration:</strong> Your data is never lost during migration. We maintain local copies until the process completes successfully.
        </AlertDescription>
      </Alert>
    </div>
  );
}