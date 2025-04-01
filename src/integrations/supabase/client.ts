
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oaffdjrvewnpeghuykoc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZmZkanJ2ZXducGVnaHV5a29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5ODQ3MDQsImV4cCI6MjA1ODU2MDcwNH0.OGR_O9wbaaGi6BlSPljRCgsjk0znokHxRrUC3bVWoKk";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
