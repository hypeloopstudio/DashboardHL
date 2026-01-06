import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isUrl = (string) => {
    try { return Boolean(new URL(string)); }
    catch (e) { return false; }
}

export const supabase = (supabaseUrl && supabaseAnonKey && isUrl(supabaseUrl))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
