export interface MemberProfile {
  id: string;
  email: string;
  role: 'member' | 'admin';
  full_name: string;
  phone: string;
  photo_url?: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal: string;
  date_of_birth?: string;
  gender?: string;
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'member' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  profile: MemberProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData: Partial<MemberProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export interface FormStep {
  title: string;
  fields: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}
