import { createClient } from '@supabase/supabase-js';

// Замени эти строки на свои данные из Supabase (Settings -> API)
const supabaseUrl = 'https://malkazttfkdeewupjzpj.supabase.co';
const supabaseAnonKey = 'sb_publishable_2OlhtYdyhXiC37piBy3iQg_PozOLGw3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);