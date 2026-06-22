import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error("Supabase environment variables are missing.")
}

export const isSupabaseConfigured = true

export const supabase: SupabaseClient<Database> = createClient<Database>(url, anonKey)
