import { createClient } from '@supabase/supabase-js';
import { config } from './config';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  priority: number;
  completed: boolean;
  created_at: string;
  user_email: string;
}

export interface DatabaseMeditationSession {
  id: string;
  duration: number;
  date: string;
  completion: boolean;
  user_email: string;
  created_at: string;
}

export interface DatabaseUserSettings {
  id: string;
  user_email: string;
  theme_mode: 'light' | 'dark';
  sync_preferences: 'local-only' | 'cloud-sync';
  location: string | null;
  created_at: string;
  updated_at: string;
}

// Database service functions
export const DatabaseService = {
  // Tasks CRUD operations
  async getTasks(userEmail: string): Promise<DatabaseTask[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    
    return data || [];
  },

  async createTask(task: Omit<DatabaseTask, 'id' | 'created_at'>): Promise<DatabaseTask> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    
    return data;
  },

  async updateTask(id: string, updates: Partial<DatabaseTask>): Promise<DatabaseTask> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Meditation sessions
  async createMeditationSession(session: Omit<DatabaseMeditationSession, 'id' | 'created_at'>): Promise<DatabaseMeditationSession> {
    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert([session])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating meditation session:', error);
      throw error;
    }
    
    return data;
  },

  async getMeditationSessions(userEmail: string, days: number = 7): Promise<DatabaseMeditationSession[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_email', userEmail)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching meditation sessions:', error);
      throw error;
    }
    
    return data || [];
  },

  // User settings
  async getUserSettings(userEmail: string): Promise<DatabaseUserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_email', userEmail)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user settings:', error);
      throw error;
    }
    
    return data;
  },

  async upsertUserSettings(settings: Omit<DatabaseUserSettings, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseUserSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert([settings], { onConflict: 'user_email' })
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting user settings:', error);
      throw error;
    }
    
    return data;
  },

  // Real-time subscriptions
  subscribeToTasks(userEmail: string, callback: (payload: any) => void) {
    return supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_email=eq.${userEmail}`,
        },
        callback
      )
      .subscribe();
  },

  // Connection status
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('tasks').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
};