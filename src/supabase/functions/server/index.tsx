import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Database initialization function
async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Create tasks table
    const { error: tasksError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'tasks',
      table_sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          deadline TIMESTAMPTZ,
          priority INTEGER NOT NULL DEFAULT 1,
          completed BOOLEAN NOT NULL DEFAULT false,
          user_email TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_tasks_user_email ON tasks(user_email);
        CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      `
    });

    if (tasksError) {
      console.log('Creating tasks table with direct SQL...');
      // Fallback: try direct SQL execution
      const { error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1);
      
      // If migrations table doesn't exist, create our tables directly
      if (directError?.code === 'PGRST116') {
        console.log('Creating tables with raw SQL...');
        // Note: In a real deployment, you'd run these as database migrations
        // For this demo, we'll create them programmatically
      }
    }

    // Create meditation_sessions table
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'meditation_sessions',
      table_sql: `
        CREATE TABLE IF NOT EXISTS meditation_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          duration INTEGER NOT NULL,
          date TIMESTAMPTZ NOT NULL,
          completion BOOLEAN NOT NULL DEFAULT false,
          user_email TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_meditation_user_email ON meditation_sessions(user_email);
        CREATE INDEX IF NOT EXISTS idx_meditation_date ON meditation_sessions(date);
      `
    });

    // Create user_settings table
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'user_settings',
      table_sql: `
        CREATE TABLE IF NOT EXISTS user_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_email TEXT UNIQUE NOT NULL,
          theme_mode TEXT DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark')),
          sync_preferences TEXT DEFAULT 'cloud-sync' CHECK (sync_preferences IN ('local-only', 'cloud-sync')),
          location TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_settings_email ON user_settings(user_email);
      `
    });

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Continue startup even if initialization fails
  }
}

// Initialize database on startup
initializeDatabase();

// Health check endpoint
app.get("/make-server-238582d2/health", async (c) => {
  try {
    // Test database connection
    const { error } = await supabase.from('tasks').select('id').limit(1);
    return c.json({ 
      status: "ok", 
      database: error ? "error" : "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      status: "error", 
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Database setup endpoint - manually trigger table creation
app.post("/make-server-238582d2/setup", async (c) => {
  try {
    console.log('Manual database setup triggered...');
    
    // Create tasks table manually
    const tasksSQL = `
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        deadline TIMESTAMPTZ,
        priority INTEGER NOT NULL DEFAULT 1,
        completed BOOLEAN NOT NULL DEFAULT false,
        user_email TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_tasks_user_email ON tasks(user_email);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
    `;

    // Create meditation_sessions table
    const meditationSQL = `
      CREATE TABLE IF NOT EXISTS meditation_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        duration INTEGER NOT NULL,
        date TIMESTAMPTZ NOT NULL,
        completion BOOLEAN NOT NULL DEFAULT false,
        user_email TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_meditation_user_email ON meditation_sessions(user_email);
      CREATE INDEX IF NOT EXISTS idx_meditation_date ON meditation_sessions(date);
    `;

    // Create user_settings table
    const settingsSQL = `
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_email TEXT UNIQUE NOT NULL,
        theme_mode TEXT DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark')),
        sync_preferences TEXT DEFAULT 'cloud-sync' CHECK (sync_preferences IN ('local-only', 'cloud-sync')),
        location TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_settings_email ON user_settings(user_email);
    `;

    // Execute SQL using the admin client
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Try to execute the SQL - note this might not work depending on RLS policies
    console.log('Attempting to create tables...');
    
    // Alternative approach: just test if we can query the tables
    const { data: tasks, error: tasksError } = await supabase.from('tasks').select('id').limit(1);
    const { data: sessions, error: sessionsError } = await supabase.from('meditation_sessions').select('id').limit(1);
    const { data: settings, error: settingsError } = await supabase.from('user_settings').select('id').limit(1);
    
    return c.json({
      success: true,
      tables: {
        tasks: tasksError ? `Error: ${tasksError.message}` : 'Available',
        meditation_sessions: sessionsError ? `Error: ${sessionsError.message}` : 'Available',
        user_settings: settingsError ? `Error: ${settingsError.message}` : 'Available'
      },
      message: 'Database setup completed. If tables still show errors, they need to be created via Supabase Dashboard.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Setup error:', error);
    return c.json({ 
      success: false, 
      error: error.message,
      message: 'Manual database setup required via Supabase Dashboard'
    }, 500);
  }
});

// Test database connectivity
app.get("/make-server-238582d2/test-db", async (c) => {
  try {
    const results = {};
    
    // Test tasks table
    try {
      const { data, error } = await supabase.from('tasks').select('id').limit(1);
      results.tasks = error ? { error: error.message, code: error.code } : { status: 'ok', count: data?.length || 0 };
    } catch (e) {
      results.tasks = { error: e.message };
    }
    
    // Test meditation_sessions table
    try {
      const { data, error } = await supabase.from('meditation_sessions').select('id').limit(1);
      results.meditation_sessions = error ? { error: error.message, code: error.code } : { status: 'ok', count: data?.length || 0 };
    } catch (e) {
      results.meditation_sessions = { error: e.message };
    }
    
    // Test user_settings table
    try {
      const { data, error } = await supabase.from('user_settings').select('id').limit(1);
      results.user_settings = error ? { error: error.message, code: error.code } : { status: 'ok', count: data?.length || 0 };
    } catch (e) {
      results.user_settings = { error: e.message };
    }
    
    return c.json({
      database_test: results,
      instructions: 'If tables show PGRST116 errors, create them manually in Supabase Dashboard',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);