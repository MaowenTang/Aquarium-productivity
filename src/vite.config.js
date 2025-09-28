import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure environment variables are properly loaded
    'import.meta.env': JSON.stringify({
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://tedtuxjjqshepibojjqc.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHR1eGpqcXNoZXBpYm9qanFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODM3MzMsImV4cCI6MjA3NDY1OTczM30.HJk7GYT_5Jo7sNtl3Ee20sRx5sSMwccwWEkxxDkv-5Y',
      VITE_OPENWEATHER_API_KEY: process.env.VITE_OPENWEATHER_API_KEY || '17f3047cd285bec7a15c2d0ecd124770'
    })
  }
})