import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserRole = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();
  return data?.role;
};

export const isAdmin = async () => {
  const role = await getUserRole();
  return role === 'admin';
};
