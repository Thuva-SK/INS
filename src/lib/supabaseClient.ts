import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqfddxfbuthmuqexodfd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZmRkeGZidXRobXVxZXhvZGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mjk4ODcsImV4cCI6MjA2ODQwNTg4N30.ZTcO4YA2nqBREbA_L4PuvbY6XkAA4cxB7UooKPdQHCE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 