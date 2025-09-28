import { Task } from '../types/Task';
import { LocalDataManager } from './LocalDataManager';
import { DatabaseService, DatabaseTask, DatabaseMeditationSession, DatabaseUserSettings } from './supabaseClient';

export type SyncMode = 'local-only' | 'cloud-sync';

export interface UserSettings {
  syncMode: SyncMode;
  location: string | null;
  themeMode: 'light' | 'dark';
}

export interface MeditationSession {
  id: string;
  duration: number;
  date: Date;
  completion: boolean;
  createdAt: Date;
}

// Unified data manager that handles both local and cloud storage
export class DataManager {
  private static instance: DataManager;
  private syncMode: SyncMode = 'local-only';
  private isOnline: boolean = navigator.onLine;
  private userEmail: string | null = null;
  private syncSubscription: any = null;

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private constructor() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWhenOnline();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async initialize(userEmail: string): Promise<void> {
    this.userEmail = userEmail;
    
    try {
      // Load user settings to determine sync mode
      const settings = await this.getUserSettings();
      this.syncMode = settings.syncMode;

      if (this.syncMode === 'cloud-sync' && this.isOnline) {
        await this.setupCloudSync();
      }
    } catch (error) {
      console.warn('Failed to initialize DataManager with cloud features, using local-only mode:', error);
      this.syncMode = 'local-only';
    }
  }

  async setSyncMode(mode: SyncMode): Promise<void> {
    const oldMode = this.syncMode;
    this.syncMode = mode;

    // Save the preference
    await this.updateUserSettings({ syncMode: mode });

    if (mode === 'cloud-sync' && oldMode === 'local-only') {
      // Migrating from local to cloud - sync local data up
      await this.migrateLocalToCloud();
      await this.setupCloudSync();
    } else if (mode === 'local-only' && oldMode === 'cloud-sync') {
      // Migrating from cloud to local - download cloud data
      await this.migrateCloudToLocal();
      this.teardownCloudSync();
    }
  }

  // Task management
  async getTasks(): Promise<Task[]> {
    if (this.syncMode === 'cloud-sync' && this.isOnline && this.userEmail) {
      try {
        const dbTasks = await DatabaseService.getTasks(this.userEmail);
        return dbTasks.map(this.convertDbTaskToTask);
      } catch (error) {
        console.warn('Cloud fetch failed, falling back to local:', error);
      }
    }
    
    return LocalDataManager.loadTasks();
  }

  async addTask(taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date()
    };

    // Always save locally first
    const currentTasks = LocalDataManager.loadTasks();
    const updatedTasks = [...currentTasks, newTask];
    LocalDataManager.saveTasks(updatedTasks);

    // Sync to cloud if enabled and online
    if (this.syncMode === 'cloud-sync' && this.isOnline && this.userEmail) {
      try {
        const dbTask = this.convertTaskToDbTask(newTask);
        await DatabaseService.createTask(dbTask);
      } catch (error) {
        console.warn('Cloud sync failed for new task:', error);
        // Task is still saved locally, will sync when online
      }
    }

    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    // Update locally
    const currentTasks = LocalDataManager.loadTasks();
    const updatedTasks = currentTasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    LocalDataManager.saveTasks(updatedTasks);

    // Sync to cloud if enabled and online
    if (this.syncMode === 'cloud-sync' && this.isOnline && this.userEmail) {
      try {
        const dbUpdates = this.convertTaskUpdatesToDbUpdates(updates);
        await DatabaseService.updateTask(id, dbUpdates);
      } catch (error) {
        console.warn('Cloud sync failed for task update:', error);
      }
    }
  }

  async deleteTask(id: string): Promise<void> {
    // Delete locally
    const currentTasks = LocalDataManager.loadTasks();
    const updatedTasks = currentTasks.filter(task => task.id !== id);
    LocalDataManager.saveTasks(updatedTasks);

    // Sync to cloud if enabled and online
    if (this.syncMode === 'cloud-sync' && this.isOnline && this.userEmail) {
      try {
        await DatabaseService.deleteTask(id);
      } catch (error) {
        console.warn('Cloud sync failed for task deletion:', error);
      }
    }
  }

  // Meditation session management
  async addMeditationSession(session: Omit<MeditationSession, 'id' | 'createdAt'>): Promise<void> {
    const newSession: MeditationSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    // Save locally (extending LocalDataManager for meditation sessions)
    const sessions = this.getLocalMeditationSessions();
    sessions.push(newSession);
    localStorage.setItem('aquarium_meditation_sessions', JSON.stringify(sessions));

    // Sync to cloud if enabled
    if (this.syncMode === 'cloud-sync' && this.isOnline && this.userEmail) {
      try {
        const dbSession: Omit<DatabaseMeditationSession, 'id' | 'created_at'> = {
          duration: session.duration,
          date: session.date.toISOString(),
          completion: session.completion,
          user_email: this.userEmail
        };
        await DatabaseService.createMeditationSession(dbSession);
      } catch (error) {
        console.warn('Cloud sync failed for meditation session:', error);
      }
    }
  }

  async getMeditationSessions(days: number = 7): Promise<MeditationSession[]> {
    if (this.syncMode === 'cloud-sync' && this.isOnline && this.userEmail) {
      try {
        const dbSessions = await DatabaseService.getMeditationSessions(this.userEmail, days);
        return dbSessions.map(session => ({
          id: session.id,
          duration: session.duration,
          date: new Date(session.date),
          completion: session.completion,
          createdAt: new Date(session.created_at)
        }));
      } catch (error) {
        console.warn('Cloud fetch failed for meditation sessions:', error);
      }
    }

    // Fallback to local data
    const sessions = this.getLocalMeditationSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sessions.filter(session => session.date >= cutoffDate);
  }

  // User settings management
  async getUserSettings(): Promise<UserSettings> {
    if (this.syncMode === 'cloud-sync' && this.isOnline && this.userEmail) {
      try {
        const dbSettings = await DatabaseService.getUserSettings(this.userEmail);
        if (dbSettings) {
          return {
            syncMode: dbSettings.sync_preferences,
            location: dbSettings.location,
            themeMode: dbSettings.theme_mode
          };
        }
      } catch (error) {
        console.warn('Cloud fetch failed for user settings:', error);
      }
    }

    // Fallback to local settings
    const localSettings = localStorage.getItem('aquarium_user_settings');
    if (localSettings) {
      return JSON.parse(localSettings);
    }

    return {
      syncMode: 'local-only',
      location: null,
      themeMode: 'light'
    };
  }

  async updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
    const currentSettings = await this.getUserSettings();
    const newSettings = { ...currentSettings, ...updates };

    // Save locally
    localStorage.setItem('aquarium_user_settings', JSON.stringify(newSettings));

    // Sync to cloud if enabled
    if (this.syncMode === 'cloud-sync' && this.isOnline && this.userEmail) {
      try {
        const dbSettings: Omit<DatabaseUserSettings, 'id' | 'created_at' | 'updated_at'> = {
          user_email: this.userEmail,
          theme_mode: newSettings.themeMode,
          sync_preferences: newSettings.syncMode,
          location: newSettings.location
        };
        await DatabaseService.upsertUserSettings(dbSettings);
      } catch (error) {
        console.warn('Cloud sync failed for user settings:', error);
      }
    }
  }

  // Utility methods
  getSyncStatus(): { mode: SyncMode; online: boolean; connected: boolean } {
    return {
      mode: this.syncMode,
      online: this.isOnline,
      connected: this.syncMode === 'cloud-sync' && this.isOnline
    };
  }

  async testCloudConnection(): Promise<boolean> {
    if (this.syncMode === 'local-only') return false;
    try {
      return await DatabaseService.testConnection();
    } catch {
      return false;
    }
  }

  // Private helper methods
  private async setupCloudSync(): Promise<void> {
    if (!this.userEmail) return;

    try {
      // Set up real-time subscription
      this.syncSubscription = DatabaseService.subscribeToTasks(this.userEmail, (payload) => {
        console.log('Real-time update:', payload);
        // Handle real-time updates here
        this.handleRealtimeUpdate(payload);
      });
    } catch (error) {
      console.warn('Failed to set up cloud sync:', error);
    }
  }

  private teardownCloudSync(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
      this.syncSubscription = null;
    }
  }

  private async migrateLocalToCloud(): Promise<void> {
    if (!this.userEmail || !this.isOnline) return;

    try {
      const localTasks = LocalDataManager.loadTasks();
      
      for (const task of localTasks) {
        const dbTask = this.convertTaskToDbTask(task);
        try {
          await DatabaseService.createTask(dbTask);
        } catch (error) {
          console.warn(`Failed to sync task ${task.id}:`, error);
        }
      }
      
      console.log(`Migrated ${localTasks.length} tasks to cloud`);
    } catch (error) {
      console.error('Failed to migrate local data to cloud:', error);
    }
  }

  private async migrateCloudToLocal(): Promise<void> {
    if (!this.userEmail || !this.isOnline) return;

    try {
      const cloudTasks = await DatabaseService.getTasks(this.userEmail);
      const localTasks = cloudTasks.map(this.convertDbTaskToTask);
      LocalDataManager.saveTasks(localTasks);
      
      console.log(`Downloaded ${localTasks.length} tasks from cloud`);
    } catch (error) {
      console.error('Failed to migrate cloud data to local:', error);
    }
  }

  private async syncWhenOnline(): Promise<void> {
    if (this.syncMode === 'cloud-sync' && this.userEmail) {
      console.log('Coming back online, syncing data...');
      await this.migrateLocalToCloud();
    }
  }

  private handleRealtimeUpdate(payload: any): void {
    // Handle real-time database updates
    console.log('Handling real-time update:', payload);
    // This would trigger UI updates when other clients modify data
  }

  private getLocalMeditationSessions(): MeditationSession[] {
    const stored = localStorage.getItem('aquarium_meditation_sessions');
    if (!stored) return [];
    
    try {
      const sessions = JSON.parse(stored);
      return sessions.map((s: any) => ({
        ...s,
        date: new Date(s.date),
        createdAt: new Date(s.createdAt)
      }));
    } catch {
      return [];
    }
  }

  private convertTaskToDbTask(task: Task): Omit<DatabaseTask, 'id' | 'created_at'> {
    return {
      title: task.title,
      description: task.description,
      deadline: task.deadline?.toISOString() || null,
      priority: task.priority,
      completed: task.completed,
      user_email: this.userEmail!
    };
  }

  private convertDbTaskToTask(dbTask: DatabaseTask): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      deadline: dbTask.deadline ? new Date(dbTask.deadline) : undefined,
      priority: dbTask.priority,
      completed: dbTask.completed,
      createdAt: new Date(dbTask.created_at)
    };
  }

  private convertTaskUpdatesToDbUpdates(updates: Partial<Task>): Partial<DatabaseTask> {
    const dbUpdates: Partial<DatabaseTask> = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline?.toISOString() || null;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    
    return dbUpdates;
  }
}