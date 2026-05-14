import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
export const supabaseBucketName = import.meta.env.VITE_SUPABASE_BUCKET || '';
export const isSupabaseConfigured =
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder' &&
    supabaseBucketName.trim().length > 0;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);