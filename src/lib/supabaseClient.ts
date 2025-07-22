import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvyykrdcvzemjzfgwyup.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eXlrcmRjdnplbWp6Zmd3eXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDg2MjYsImV4cCI6MjA2NTMyNDYyNn0.nIx9R_1tTGsLH1F54fcYFgsy_cpqVdcx11RLv2_W7M0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
