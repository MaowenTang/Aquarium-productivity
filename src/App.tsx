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
import { Task } from './types/Task';
import { LocalDataManager } from './utils/LocalDataManager';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Load data locally only
  useEffect(() => {
    loadData();
  }, []);

  // Save data when it changes - local only
  useEffect(() => {
    if (user && tasks.length >= 0) {
      LocalDataManager.saveTasks(tasks);
    }
  }, [tasks]);

  const loadData = () => {
    try {
      // Run data migration first to ensure compatibility
      LocalDataManager.migrateDataFormat();
      
      const savedUser = LocalDataManager.loadUser();
      const savedTasks = LocalDataManager.loadTasks();
      
      if (savedUser) {
        setUser(savedUser);
        setTasks(savedTasks);
      }
      
      console.log('[Privacy] Data loaded from local storage only');
    } catch (error) {
      console.error('[Privacy] Error loading local data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (email: string) => {
    setUser(email);
    LocalDataManager.saveUser(email);
    setCurrentScreen('dashboard');
    console.log('[Privacy] User session created locally');
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setCurrentScreen('dashboard');
    LocalDataManager.removeUser();
    console.log('[Privacy] User session ended');
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

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleCompleteTask = (id: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: true } : task
      )
    );
  };

  const handleChangePriority = (id: string, priority: number) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, priority } : task
      )
    );
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