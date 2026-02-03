import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, MemberProfile, User } from '../types';
import { authApi, profileApi } from '../services/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authApi.getSession();
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role || 'member',
        };
        setUser(userData);
        
        const profileData = await profileApi.getProfile(session.user.id);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { user: authUser } = await authApi.signIn(email, password);
    if (authUser) {
      const userData: User = {
        id: authUser.id,
        email: authUser.email!,
        role: authUser.user_metadata?.role || 'member',
      };
      setUser(userData);
      
      const profileData = await profileApi.getProfile(authUser.id);
      setProfile(profileData);
    }
  };

  const signUp = async (email: string, password: string, profileData: Partial<MemberProfile>) => {
    // Step 1: Check phone constraints (Supabase Auth handles Email, we must handle Phone)
    if (profileData.phone) {
      const phoneExists = await profileApi.checkPhoneExists(profileData.phone);
      if (phoneExists) {
        throw new Error('This phone number is already registered. Please use a different phone number.');
      }
    }

    // Step 2: Create auth user
    let authUserId: string | null = null;
    try {
      const result = await authApi.signUp(email, password);
      if (!result.user) {
        throw new Error('Failed to create user account');
      }
      authUserId = result.user.id;
    } catch (error: any) {
      // Auth error (e.g., email already exists)
      throw new Error(error.message || 'Failed to create user account');
    }

    // Step 3: Create profile
    try {
      const newProfile = await profileApi.createProfile({
        id: authUserId,
        email,
        role: 'member',
        is_verified: false,
        is_approved: false,
        ...profileData,
      });

      const userData: User = {
        id: authUserId,
        email,
        role: 'member',
      };
      setUser(userData);
      setProfile(newProfile);
    } catch (profileError: any) {
      // Profile creation failed - show specific error
      const errorMessage = profileError.message || '';
      
      if (errorMessage.includes('profiles_phone_key') || 
          errorMessage.includes('duplicate key')) {
        throw new Error('This phone number is already registered. Please use a different phone number.');
      }
      
      throw new Error(profileError.message || 'Failed to create profile');
    }
  };

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await profileApi.getProfile(user.id);
      setProfile(profileData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
