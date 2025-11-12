import { useEffect, useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Dashboard } from './components/Dashboard';
import { EnhancedPlanner } from './components/EnhancedPlanner';
import { FocusMode } from './components/FocusMode';
import { MeditationHub } from './components/MeditationModule';
import { Navigation } from './components/Navigation';
import { TaskInput } from './components/TaskInput';
import { Task } from './types/Task';
import { OceanWaves } from './components/OceanWaves';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { AuthUser } from './types/Auth';
import { LoginScreen } from './components/LoginScreen';
import { DataManager } from './utils/DataManager';
import { Settings } from './components/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { initializeRecurringTask } from './utils/recurringTasks';
import { DatabaseSetup } from './components/DatabaseSetup';
import { supabase } from './utils/supabaseClient';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'planner' | 'focus' | 'meditation' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [needsDatabaseSetup, setNeedsDatabaseSetup] = useState(false);
  const [dataManager] = useState(() => DataManager.getInstance());
  const [syncStatus, setSyncStatus] = useState(() => ({
    mode: 'cloud-sync' as const,
    isOnline: navigator.onLine,
    isConnected: navigator.onLine
  }));

  // Get user email from user object
  const userEmail = user?.email || null;

  // Initialize app and check for existing session
  useEffect(() => {
    checkExistingSession();
    
    // Monitor sync status
    const updateSyncStatus = () => {
      const status = dataManager.getSyncStatus();
      setSyncStatus(status);
    };
    
    // Update status periodically
    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 10000);
    
    // Listen for online/offline events
    const handleOnline = () => updateSyncStatus();
    const handleOffline = () => updateSyncStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dataManager]);

  const checkDatabaseTables = async (): Promise<boolean> => {
    try {
      // Test if the main tables exist by making simple queries
      const { error: tasksError } = await supabase.from('tasks').select('id').limit(1);
      const { error: sessionsError } = await supabase.from('meditation_sessions').select('id').limit(1);
      const { error: settingsError } = await supabase.from('user_settings').select('id').limit(1);
      
      // Check if any table is missing (PGRST205 or PGRST116 indicates missing table)
      const hasMissingTables = [tasksError, sessionsError, settingsError].some(error => 
        error && (error.code === 'PGRST205' || error.code === 'PGRST116' || error.message?.includes('not configured'))
      );
      
      if (hasMissingTables) {
        console.log('[Setup] Some database tables are missing or Supabase not configured');
        return false;
      }
      
      console.log('[Setup] All database tables exist');
      return true;
    } catch (error) {
      console.log('[Setup] Error checking database tables:', error);
      return false;
    }
  };

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        setUser(session.user);
        
        // Initialize DataManager with user
        await dataManager.initialize(session.user.email);
        
        // First check if database tables exist before trying to load tasks
        const tablesExist = await checkDatabaseTables();
        
        if (!tablesExist) {
          console.log('[Setup] Database tables not found, showing setup screen');
          setNeedsDatabaseSetup(true);
        } else {
          // Load tasks only if tables exist
          try {
            const loadedTasks = await dataManager.getTasks();
            setTasks(loadedTasks);
            console.log('[Auth] Session restored and data loaded');
          } catch (error: any) {
            console.error('Failed to load tasks during session restore:', error);
            
            // Still check for database errors as fallback
            if (error.message?.includes('Database tables not found') || 
                error.message?.includes('Could not find the table') ||
                error.code === 'PGRST116' ||
                error.code === 'PGRST205' ||
                (error.message && error.message.includes('PGRST205'))) {
              setNeedsDatabaseSetup(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Auth] Error restoring session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userObj: AuthUser) => {
    setUser(userObj);
    
    // Initialize DataManager with user email
    if (!userObj.email) {
      console.error('[Auth] User object has no email');
      return;
    }
    
    await dataManager.initialize(userObj.email);
    
    // First check if database tables exist before trying to load tasks
    const tablesExist = await checkDatabaseTables();
    
    if (!tablesExist) {
      console.log('[Setup] Database tables not found, showing setup screen');
      setNeedsDatabaseSetup(true);
      return;
    }
    
    // Load tasks only if tables exist
    try {
      const loadedTasks = await dataManager.getTasks();
      setTasks(loadedTasks);
      setCurrentScreen('dashboard');
      console.log('[Auth] User session created and data loaded');
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      
      // Check if this is a database setup issue
      if (error.message?.includes('Database tables not found') || 
          error.message?.includes('Could not find the table') ||
          error.code === 'PGRST116' ||
          error.code === 'PGRST205' ||
          (error.message && error.message.includes('PGRST205'))) {
        setNeedsDatabaseSetup(true);
      } else {
        setTasks([]);
        setCurrentScreen('dashboard');
        alert('❌ Failed to load tasks. Please check your internet connection and try again.');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dataManager.cleanup();
    setUser(null);
    setTasks([]);
    setCurrentScreen('dashboard');
    console.log('[Auth] User session ended');
  };

  const handleClearData = async () => {
    const confirmed = confirm(
      '⚠️ PERMANENT DATA DELETION\n\n' +
      'This will permanently delete ALL your cloud data including:\n' +
      '• All tasks and schedules\n' +
      '• Focus session history\n' +
      '• Meditation records\n' +
      '• App preferences\n\n' +
      'This action cannot be undone.\n\n' +
      'Are you absolutely sure you want to continue?'
    );
    
    if (confirmed) {
      const doubleConfirm = confirm(
        'FINAL CONFIRMATION\n\n' +
        'This will delete all data from your Supabase account.'
      );
      
      if (doubleConfirm) {
        try {
          // Clear all user tasks and data from Supabase
          if (user) {
            const allTasks = await dataManager.getTasks();
            for (const task of allTasks) {
              await dataManager.deleteTask(task.id);
            }
          }
          
          setTasks([]);
          await handleLogout();
          
          console.log('[Data] All cloud data permanently deleted');
          alert('✅ All data has been permanently deleted from your account.');
        } catch (error) {
          console.error('Error clearing data:', error);
          alert('❌ Failed to delete all data. Please try again.');
        }
      }
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    try {
      // Initialize recurring task with nextOccurrence if it's a recurring task
      const taskToAdd = taskData.isRecurring && taskData.recurrence
        ? initializeRecurringTask(taskData)
        : taskData;
      
      const newTask = await dataManager.addTask(taskToAdd);
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('❌ Failed to add task. Please check your internet connection and try again.');
    }
  };

  const handleCompleteTask = async (id: string) => {
    // Optimistic UI update
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: true } : task
      )
    );

    try {
      await dataManager.updateTask(id, { completed: true });
    } catch (error) {
      console.error('Failed to complete task:', error);
      // Revert the optimistic update
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, completed: false } : task
        )
      );
      alert('❌ Failed to update task. Please check your internet connection and try again.');
    }
  };

  const handleChangePriority = async (id: string, priority: number) => {
    const originalTask = tasks.find(task => task.id === id);
    
    // Optimistic UI update
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, priority } : task
      )
    );

    try {
      await dataManager.updateTask(id, { priority });
    } catch (error) {
      console.error('Failed to update task priority:', error);
      // Revert the optimistic update
      if (originalTask) {
        setTasks(prev => 
          prev.map(task => 
            task.id === id ? { ...task, priority: originalTask.priority } : task
          )
        );
      }
      alert('❌ Failed to update task priority. Please check your internet connection and try again.');
    }
  };

  const handleUpdateTasks = async (updatedTasks: Task[]) => {
    const originalTasks = [...tasks];
    
    // Optimistic UI update
    setTasks(updatedTasks);

    try {
      // Update all modified tasks in the database
      await Promise.all(
        updatedTasks.map(async (task) => {
          const originalTask = originalTasks.find(t => t.id === task.id);
          // Only update if priority changed
          if (originalTask && originalTask.priority !== task.priority) {
            await dataManager.updateTask(task.id, { priority: task.priority });
          }
        })
      );
    } catch (error) {
      console.error('Failed to update tasks:', error);
      // Revert the optimistic update
      setTasks(originalTasks);
      alert('❌ Failed to apply AI suggestions. Please check your internet connection and try again.');
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-2xl">🌊</span>
          </div>
          <p className="text-blue-700 font-medium">Loading your aquarium...</p>
        </div>
      </div>
    );
  }

  if (needsDatabaseSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
        <OceanWaves />
        <DatabaseSetup 
          onSetupComplete={async () => {
            setNeedsDatabaseSetup(false);
            // Retry loading data after setup
            if (user) {
              try {
                const loadedTasks = await dataManager.getTasks();
                setTasks(loadedTasks);
                setCurrentScreen('dashboard');
                console.log('[Setup] Database setup complete, data loaded successfully');
              } catch (error) {
                console.error('[Setup] Failed to load data after setup:', error);
                // If it still fails, show the setup screen again
                setNeedsDatabaseSetup(true);
              }
            }
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
        <OceanWaves />
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const renderCurrentScreen = () => {
    if (!userEmail) return null;
    
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard
            user={userEmail}
            tasks={tasks}
            onAddTask={handleAddTask}
            onCompleteTask={handleCompleteTask}
            onChangePriority={handleChangePriority}
            onUpdateTasks={handleUpdateTasks}
            onLogout={handleLogout}
          />
        );
      case 'planner':
        return (
          <EnhancedPlanner
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onChangePriority={handleChangePriority}
          />
        );
      case 'focus':
        return (
          <FocusMode
            onBreakTime={() => setCurrentScreen('meditation')}
          />
        );
      case 'meditation':
        return (
          <MeditationHub
            isStandalone={true}
          />
        );
      case 'settings':
        return (
          <Settings
            user={userEmail}
            onLogout={handleLogout}
            onClearData={handleClearData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 relative">
        <OceanWaves />
        
        {/* Sync Status Indicator */}
        {user && <SyncStatusIndicator position="top-right" />}
        
        <Navigation
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          onLogout={handleLogout}
          user={userEmail}
          tasksCount={activeTasks.length}
        />
        
        <main className="relative z-10 max-w-7xl mx-auto px-4 pt-20 md:pt-24 pb-32 md:pb-8">
          {renderCurrentScreen()}
        </main>

        {/* Global Task Input - only show on dashboard and planner */}
        {(currentScreen === 'dashboard' || currentScreen === 'planner') && (
          <TaskInput onAddTask={handleAddTask} />
        )}
        
        {/* Toast notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}