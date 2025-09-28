import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { EnhancedPlanner } from './components/EnhancedPlanner';
import { FocusMode } from './components/FocusMode';
import { MeditationModule } from './components/MeditationModule';
import { Settings } from './components/Settings';
import { Navigation, NavigationScreen } from './components/Navigation';
import { TaskInput } from './components/TaskInput';
import { OceanWaves } from './components/OceanWaves';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { Task } from './types/Task';
import { DataManager } from './utils/DataManager';
import { LocalDataManager } from './utils/LocalDataManager';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [dataManager] = useState(() => DataManager.getInstance());

  // Load data using DataManager
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Run data migration first to ensure compatibility
      LocalDataManager.migrateDataFormat();
      
      const savedUser = LocalDataManager.loadUser();
      
      if (savedUser) {
        setUser(savedUser);
        
        // Initialize DataManager with user
        await dataManager.initialize(savedUser);
        
        // Load tasks using DataManager
        const loadedTasks = await dataManager.getTasks();
        setTasks(loadedTasks);
        
        console.log('[Data] Data loaded successfully');
      }
    } catch (error) {
      console.error('[Data] Error loading data:', error);
      // Fallback to local data
      const savedTasks = LocalDataManager.loadTasks();
      setTasks(savedTasks);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string) => {
    setUser(email);
    LocalDataManager.saveUser(email);
    
    // Initialize DataManager with user
    await dataManager.initialize(email);
    
    // Load tasks
    const loadedTasks = await dataManager.getTasks();
    setTasks(loadedTasks);
    
    setCurrentScreen('dashboard');
    console.log('[Data] User session created and data loaded');
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setCurrentScreen('dashboard');
    LocalDataManager.removeUser();
    console.log('[Data] User session ended');
  };

  const handleClearData = () => {
    const confirmed = confirm(
      '⚠️ PERMANENT DATA DELETION\n\n' +
      'This will permanently delete ALL your local data including:\n' +
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
        'Type "DELETE" to confirm permanent data deletion.'
      );
      
      if (doubleConfirm) {
        setTasks([]);
        setUser(null);
        LocalDataManager.clearAllData();
        setCurrentScreen('dashboard');
        console.log('[Privacy] All local data permanently deleted');
        alert('✅ All data has been permanently deleted from your device.');
      }
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    try {
      const newTask = await dataManager.addTask(taskData);
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to add task:', error);
      // Fallback to local only
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date()
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await dataManager.updateTask(id, { completed: true });
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, completed: true } : task
        )
      );
    } catch (error) {
      console.error('Failed to complete task:', error);
      // Still update UI for immediate feedback
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, completed: true } : task
        )
      );
    }
  };

  const handleChangePriority = async (id: string, priority: number) => {
    try {
      await dataManager.updateTask(id, { priority });
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, priority } : task
        )
      );
    } catch (error) {
      console.error('Failed to update task priority:', error);
      // Still update UI for immediate feedback
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, priority } : task
        )
      );
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
        <OceanWaves />
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            tasks={tasks}
            onAddTask={handleAddTask}
            onCompleteTask={handleCompleteTask}
            onChangePriority={handleChangePriority}
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
          <MeditationModule
            isStandalone={true}
          />
        );
      case 'settings':
        return (
          <Settings
            user={user}
            onLogout={handleLogout}
            onClearData={handleClearData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 relative">
      <OceanWaves />
      
      {/* Sync Status Indicator */}
      {user && <SyncStatusIndicator position="top-right" />}
      
      <Navigation
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        onLogout={handleLogout}
        user={user}
        tasksCount={activeTasks.length}
      />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4">
        {renderCurrentScreen()}
      </main>

      {/* Global Task Input - only show on dashboard and planner */}
      {(currentScreen === 'dashboard' || currentScreen === 'planner') && (
        <TaskInput onAddTask={handleAddTask} />
      )}
    </div>
  );
}