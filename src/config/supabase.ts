// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dhuixeoivmnmjqaztekw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodWl4ZW9pdm1ubWpxYXp0ZWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDIwNDQsImV4cCI6MjA2ODk3ODA0NH0.2OdCMtbEWdpWBbrPzKpYqRZ4LWfW20AQPWSSK6EQEu0';

console.log('🔧 Initializing Supabase client...');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client created and exported');

export const testConnection = async () => {
  console.log('🧪 Testing connection from config file...');

  try {
    // Test a simple query to see if we can reach Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    console.log('📊 Connection test result:', { data, error });

    if (error) {
      console.log(
        '🤔 Got error (this might be normal):',
        error.code,
        error.message,
      );

      // These error codes mean the connection works but table doesn't exist yet
      if (
        error.code === 'PGRST116' ||
        error.code === '42P01' ||
        error.message.includes('does not exist')
      ) {
        console.log(
          '✅ Connection successful! (Table not found is expected before DB setup)',
        );
        return true;
      }

      // Check for authentication/permission errors
      if (error.code === 'PGRST301' || error.message.includes('permission')) {
        console.log(
          '✅ Connection successful! (Permission denied is expected with RLS)',
        );
        return true;
      }

      console.log('❌ Unexpected error:', error);
      return false;
    } else {
      console.log('✅ Connection successful with data!');
      return true;
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

// Make sure we export both named and default exports
const supabaseConfig = {
  supabase,
  testConnection,
};

export default supabaseConfig;
