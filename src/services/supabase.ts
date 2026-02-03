import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MemberProfile } from '../types';

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

export const authApi = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};

export const profileApi = {
  getProfile: async (userId: string): Promise<MemberProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  createProfile: async (profile: Partial<MemberProfile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId: string, updates: Partial<MemberProfile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  getAllProfiles: async (): Promise<MemberProfile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  uploadPhoto: async (userId: string, base64Image: string) => {
    // Use a fixed filename so it overwrites the previous one
    const fileName = `${userId}/profile.jpg`;
    const timestamp = Date.now();
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, decode(base64Image), {
        contentType: 'image/jpeg',
        upsert: true, // This forces overwrite!
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);
    
    // Add timestamp to URL to force UI to refresh the image
    return `${publicUrl}?t=${timestamp}`;
  },
};

// Helper to decode base64
import { decode } from 'base64-arraybuffer';
