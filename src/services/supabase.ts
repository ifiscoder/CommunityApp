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

  checkPhoneExists: async (phone: string): Promise<boolean> => {
    const { data, error } = await supabase
      .rpc('check_phone_exists', { phone_number: phone });

    if (error) {
      console.error('Phone check error:', error);
      return false;
    }
    return data || false;
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
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    // Fetch the updated profile separately (handles RLS issues)
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;
    return data;
  },

  deleteProfile: async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
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
    const fileName = `${userId}/profile.jpg`;
    const timestamp = Date.now();

    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, decode(base64Image), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return `${publicUrl}?t=${timestamp}`;
  },
};

import { decode } from 'base64-arraybuffer';
