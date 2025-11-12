import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Database, AlertCircle, CheckCircle, RefreshCw, Copy, ExternalLink } from 'lucide-react';

interface DatabaseSetupProps {
  onSetupComplete?: () => void;
}

export function DatabaseSetup({ onSetupComplete }: DatabaseSetupProps) {
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const setupSQL = `-- Aquarium Serenity Database Setup
-- Copy and paste this SQL into your Supabase SQL Editor

-- Create tasks table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  deadline timestamptz,
  priority integer not null default 1,
  completed boolean not null default false,
  user_email text not null,
  created_at timestamptz default now()
);

-- Create meditation_sessions table
create table if not exists public.meditation_sessions (
  id uuid default gen_random_uuid() primary key,
  duration integer not null,
  date timestamptz not null,
  completion boolean not null default false,
  user_email text not null,
  created_at timestamptz default now()
);

-- Create user_settings table
create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_email text unique not null,
  theme_mode text default 'light' check (theme_mode in ('light', 'dark')),
  sync_preferences text default 'cloud-sync' check (sync_preferences in ('local-only', 'cloud-sync')),
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for better performance
create index if not exists idx_tasks_user_email on public.tasks(user_email);
create index if not exists idx_tasks_created_at on public.tasks(created_at);
create index if not exists idx_meditation_user_email on public.meditation_sessions(user_email);
create index if not exists idx_meditation_date on public.meditation_sessions(date);
create index if not exists idx_user_settings_email on public.user_settings(user_email);

-- Enable Row Level Security (RLS)
alter table public.tasks enable row level security;
alter table public.meditation_sessions enable row level security;
alter table public.user_settings enable row level security;

-- Create RLS policies for tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.jwt() ->> 'email' = user_email);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.jwt() ->> 'email' = user_email);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.jwt() ->> 'email' = user_email);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.jwt() ->> 'email' = user_email);

-- Create RLS policies for meditation_sessions
create policy "Users can view their own meditation sessions"
  on public.meditation_sessions for select
  using (auth.jwt() ->> 'email' = user_email);

create policy "Users can insert their own meditation sessions"
  on public.meditation_sessions for insert
  with check (auth.jwt() ->> 'email' = user_email);

-- Create RLS policies for user_settings
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.jwt() ->> 'email' = user_email);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.jwt() ->> 'email' = user_email);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.jwt() ->> 'email' = user_email);`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(setupSQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = setupSQL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const openSupabaseDashboard = () => {
    const projectId = 'tedtuxjjqshepibojjqc'; // From the config
    window.open(`https://supabase.com/dashboard/project/${projectId}/sql`, '_blank');
  };

  const testDatabase = async () => {
    setIsSetupRunning(true);
    try {
      // Test the database tables directly using Supabase client
      const { supabase } = await import('../utils/supabaseClient');
      
      const results: any = {};
      let allTablesExist = true;
      
      // Test tasks table
      try {
        const { data, error } = await supabase.from('tasks').select('id').limit(1);
        results.tasks = error ? { error: error.message, code: error.code } : { status: 'ok', count: data?.length || 0 };
        if (error) allTablesExist = false;
      } catch (e: any) {
        results.tasks = { error: e.message };
        allTablesExist = false;
      }
      
      // Test meditation_sessions table
      try {
        const { data, error } = await supabase.from('meditation_sessions').select('id').limit(1);
        results.meditation_sessions = error ? { error: error.message, code: error.code } : { status: 'ok', count: data?.length || 0 };
        if (error) allTablesExist = false;
      } catch (e: any) {
        results.meditation_sessions = { error: e.message };
        allTablesExist = false;
      }
      
      // Test user_settings table
      try {
        const { data, error } = await supabase.from('user_settings').select('id').limit(1);
        results.user_settings = error ? { error: error.message, code: error.code } : { status: 'ok', count: data?.length || 0 };
        if (error) allTablesExist = false;
      } catch (e: any) {
        results.user_settings = { error: e.message };
        allTablesExist = false;
      }
      
      setTestResult({
        database_test: results,
        allTablesExist,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setTestResult({ 
        error: error.message, 
        allTablesExist: false,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSetupRunning(false);
    }
  };

  const getTableStatus = (tableResult: any) => {
    if (tableResult?.status === 'ok') {
      return <Badge variant="outline" className="text-green-700 border-green-300">Available</Badge>;
    } else if (tableResult?.error) {
      return <Badge variant="outline" className="text-red-700 border-red-300">Missing</Badge>;
    } else {
      return <Badge variant="outline" className="text-gray-500 border-gray-300">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <Card className="backdrop-blur-sm border-2 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center"
            >
              <Database className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Database Setup Required
            </CardTitle>
            <p className="text-blue-600">
              Welcome to Aquarium Serenity! Before you can start managing your tasks, we need to set up your database tables. This is a quick one-time setup process.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Copy the SQL code below and run it in your Supabase Dashboard to create the required database tables.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Setup Instructions
                </h4>
                <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                  <li>Click "Open Supabase Dashboard" below</li>
                  <li>Navigate to the SQL Editor in your dashboard</li>
                  <li>Copy the SQL code and paste it into the editor</li>
                  <li>Click "Run" to create the tables and policies</li>
                  <li>Return here and click "Test & Continue"</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={openSupabaseDashboard}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl shadow-lg"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Supabase Dashboard
                </Button>
                
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex items-center gap-2 rounded-2xl"
                >
                  <Copy className="h-4 w-4" />
                  {copiedSql ? 'Copied!' : 'Copy SQL Code'}
                </Button>
              </div>
              
              <Button
                onClick={testDatabase}
                disabled={isSetupRunning}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl shadow-lg"
              >
                {isSetupRunning ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testing database...</span>
                  </div>
                ) : (
                  'Test & Continue'
                )}
              </Button>
            </div>

            {/* SQL Code Display */}
            <div className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-96 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">SQL Setup Code:</span>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="whitespace-pre-wrap break-words text-green-300">{setupSQL}</pre>
            </div>

            {testResult && (
              <Alert className={testResult.allTablesExist ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
                {testResult.allTablesExist ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className={`font-medium ${testResult.allTablesExist ? 'text-green-700' : 'text-orange-700'}`}>
                      {testResult.allTablesExist ? '✅ All tables are ready!' : '⚠️ Some tables are missing'}
                    </p>
                    {testResult.database_test && (
                      <div className="text-sm space-y-1">
                        {Object.entries(testResult.database_test).map(([table, result]: [string, any]) => (
                          <div key={table} className="flex items-center justify-between">
                            <span className="capitalize">{table.replace('_', ' ')}:</span>
                            {getTableStatus(result)}
                          </div>
                        ))}
                      </div>
                    )}
                    {testResult.allTablesExist ? (
                      <Button
                        onClick={() => onSetupComplete?.()}
                        className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl text-white font-medium"
                      >
                        🌊 Dive into your Aquarium Serenity
                      </Button>
                    ) : (
                      <p className="text-sm text-orange-600 mt-2">
                        Please run the SQL code in your Supabase Dashboard and then test again.
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}