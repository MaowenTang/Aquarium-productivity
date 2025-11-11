// Environment configuration with fallbacks
export const config = {
  supabase: {
    url: import.meta.env?.VITE_SUPABASE_URL || 'https://tedtuxjjqshepibojjqc.supabase.co',
    anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHR1eGpqcXNoZXBpYm9qanFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODM3MzMsImV4cCI6MjA3NDY1OTczM30.HJk7GYT_5Jo7sNtl3Ee20sRx5sSMwccwWEkxxDkv-5Y'
  },
  openweather: {
    apiKey: import.meta.env?.VITE_OPENWEATHER_API_KEY || '17f3047cd285bec7a15c2d0ecd124770'
  }
};

// Check if we're in a supported environment
export const isSupported = typeof import.meta !== 'undefined' && import.meta.env !== undefined;

console.log('[Config] Environment loaded:', {
  hasSupabaseUrl: !!config.supabase.url,
  hasSupabaseKey: !!config.supabase.anonKey,
  hasWeatherKey: !!config.openweather.apiKey,
  isSupported
});