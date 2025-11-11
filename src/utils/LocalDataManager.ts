import { Task } from '../types/Task';

export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  focusReminders: boolean;
  meditationReminders: boolean;
  soundVolume: number;
  theme: string;
  focusDuration: number;
  breakDuration: number;
  localOnlyMode: boolean;
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  lastBackupDate?: string;
}

export interface FocusSession {
  id: string;
  type: 'focus' | 'short-break' | 'long-break';
  duration: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
  date: string;
}

export interface MeditationSession {
  id: string;
  type: 'breathing' | 'meditation' | 'visualization';
  duration: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
  date: string;
}

export interface AppData {
  tasks: Task[];
  preferences: UserPreferences;
  focusSessions: FocusSession[];
  meditationSessions: MeditationSession[];
  version: string;
  lastModified: string;
}

const STORAGE_KEYS = {
  TASKS: 'aquarium-tasks',
  USER: 'aquarium-user', 
  PREFERENCES: 'aquarium-preferences',
  FOCUS_SESSIONS: 'aquarium-focus-sessions',
  MEDITATION_SESSIONS: 'aquarium-meditation-sessions',
  APP_LOCK: 'aquarium-app-lock',
  LAST_BACKUP: 'aquarium-last-backup'
} as const;

const DEFAULT_PREFERENCES: UserPreferences = {
  darkMode: false,
  notifications: true,
  focusReminders: true,
  meditationReminders: false,
  soundVolume: 75,
  theme: 'ocean',
  focusDuration: 25,
  breakDuration: 5,
  localOnlyMode: true,
  appLockEnabled: false,
  biometricEnabled: false
};

export class LocalDataManager {
  // Data Migration - run once to ensure all data is properly formatted
  static migrateDataFormat(): void {
    try {
      // Check each storage key and ensure proper JSON format
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const item = localStorage.getItem(storageKey);
        if (item) {
          try {
            // Try to parse as JSON
            JSON.parse(item);
            console.log(`[Privacy] Data format OK: ${key}`);
          } catch (error) {
            // If parsing fails, try to fix the format
            console.log(`[Privacy] Migrating data format: ${key}`);
            
            // For USER key, wrap plain string in JSON
            if (key === 'USER' && item && !item.startsWith('"')) {
              localStorage.setItem(storageKey, JSON.stringify(item));
              console.log(`[Privacy] Migrated user data format`);
            }
          }
        }
      });
    } catch (error) {
      console.error('[Privacy] Data migration failed:', error);
    }
  }

  // Data Storage
  static saveData(key: keyof typeof STORAGE_KEYS, data: any): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEYS[key], serializedData);
      console.log(`[Privacy] Data saved locally: ${key}`);
    } catch (error) {
      console.error(`[Privacy] Failed to save ${key}:`, error);
      throw new Error(`Failed to save ${key} to local storage`);
    }
  }

  static loadData<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    try {
      const item = localStorage.getItem(STORAGE_KEYS[key]);
      if (!item) return defaultValue;
      
      // Handle case where data might be stored as plain string (legacy)
      let parsed;
      try {
        parsed = JSON.parse(item);
      } catch (parseError) {
        // If JSON parsing fails, treat as plain string for backward compatibility
        if (typeof defaultValue === 'string') {
          console.log(`[Privacy] Legacy string data loaded: ${key}`);
          return item as T;
        }
        throw parseError;
      }
      
      console.log(`[Privacy] Data loaded locally: ${key}`);
      return parsed;
    } catch (error) {
      console.error(`[Privacy] Failed to load ${key}:`, error);
      return defaultValue;
    }
  }

  static removeData(key: keyof typeof STORAGE_KEYS): void {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
      console.log(`[Privacy] Data removed locally: ${key}`);
    } catch (error) {
      console.error(`[Privacy] Failed to remove ${key}:`, error);
    }
  }

  // Tasks Management
  static saveTasks(tasks: Task[]): void {
    this.saveData('TASKS', tasks);
  }

  static loadTasks(): Task[] {
    const tasks = this.loadData('TASKS', []);
    return tasks.map((task: any) => ({
      ...task,
      deadline: task.deadline ? new Date(task.deadline) : undefined,
      createdAt: new Date(task.createdAt)
    }));
  }

  // User Management
  static saveUser(email: string): void {
    this.saveData('USER', email);
  }

  static loadUser(): string | null {
    const user = this.loadData('USER', null);
    
    // Ensure user data is properly serialized going forward
    if (user && typeof user === 'string') {
      // Re-save to ensure proper JSON serialization
      this.saveData('USER', user);
    }
    
    return user;
  }

  static removeUser(): void {
    this.removeData('USER');
  }

  // Preferences Management
  static savePreferences(preferences: Partial<UserPreferences>): void {
    const current = this.loadPreferences();
    const updated = { ...current, ...preferences };
    this.saveData('PREFERENCES', updated);
  }

  static loadPreferences(): UserPreferences {
    return this.loadData('PREFERENCES', DEFAULT_PREFERENCES);
  }

  // Focus Sessions
  static saveFocusSession(session: FocusSession): void {
    const sessions = this.loadFocusSessions();
    sessions.push(session);
    // Keep only last 100 sessions for performance
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    this.saveData('FOCUS_SESSIONS', sessions);
  }

  static loadFocusSessions(): FocusSession[] {
    return this.loadData('FOCUS_SESSIONS', []);
  }

  // Meditation Sessions
  static saveMeditationSession(session: MeditationSession): void {
    const sessions = this.loadMeditationSessions();
    sessions.push(session);
    // Keep only last 100 sessions for performance
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    this.saveData('MEDITATION_SESSIONS', sessions);
  }

  static loadMeditationSessions(): MeditationSession[] {
    return this.loadData('MEDITATION_SESSIONS', []);
  }

  // Complete Data Export
  static exportAllData(): AppData {
    const data: AppData = {
      tasks: this.loadTasks(),
      preferences: this.loadPreferences(),
      focusSessions: this.loadFocusSessions(),
      meditationSessions: this.loadMeditationSessions(),
      version: '1.0.0',
      lastModified: new Date().toISOString()
    };
    console.log('[Privacy] All data exported locally');
    return data;
  }

  // Data Import
  static importAllData(data: AppData): void {
    try {
      if (data.tasks) {
        const tasks = data.tasks.map((task: any) => ({
          ...task,
          deadline: task.deadline ? new Date(task.deadline) : undefined,
          createdAt: new Date(task.createdAt)
        }));
        this.saveTasks(tasks);
      }
      
      if (data.preferences) {
        this.savePreferences(data.preferences);
      }
      
      if (data.focusSessions) {
        this.saveData('FOCUS_SESSIONS', data.focusSessions);
      }
      
      if (data.meditationSessions) {
        this.saveData('MEDITATION_SESSIONS', data.meditationSessions);
      }
      
      console.log('[Privacy] All data imported successfully');
    } catch (error) {
      console.error('[Privacy] Import failed:', error);
      throw new Error('Failed to import data');
    }
  }

  // Complete Data Wipe
  static clearAllData(): void {
    const keys = Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>;
    keys.forEach(key => this.removeData(key));
    console.log('[Privacy] All local data cleared');
  }

  // Backup Management
  static createBackup(): Blob {
    const data = this.exportAllData();
    const backup = {
      ...data,
      backupDate: new Date().toISOString(),
      backupVersion: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    });
    
    // Save backup metadata
    this.saveData('LAST_BACKUP', new Date().toISOString());
    console.log('[Privacy] Backup created locally');
    return blob;
  }

  static getStorageInfo(): {
    totalSize: number;
    itemCount: number;
    items: Array<{ key: string; size: number }>;
  } {
    const items: Array<{ key: string; size: number }> = [];
    let totalSize = 0;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        const size = new Blob([item]).size;
        items.push({ key, size });
        totalSize += size;
      }
    });
    
    return {
      totalSize,
      itemCount: items.length,
      items
    };
  }

  // Security
  static setAppLock(enabled: boolean): void {
    this.saveData('APP_LOCK', enabled);
  }

  static isAppLockEnabled(): boolean {
    return this.loadData('APP_LOCK', false);
  }

  // Privacy compliance helpers
  static getDataSummary(): {
    tasks: number;
    focusSessions: number;
    meditationSessions: number;
    storageSize: string;
    lastBackup?: string;
  } {
    const tasks = this.loadTasks();
    const focusSessions = this.loadFocusSessions();
    const meditationSessions = this.loadMeditationSessions();
    const storageInfo = this.getStorageInfo();
    const lastBackup = this.loadData('LAST_BACKUP', null);
    
    return {
      tasks: tasks.length,
      focusSessions: focusSessions.length,
      meditationSessions: meditationSessions.length,
      storageSize: `${(storageInfo.totalSize / 1024).toFixed(1)} KB`,
      lastBackup
    };
  }
}