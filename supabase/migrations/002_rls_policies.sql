-- STEP 2: Create RLS Policies
-- Run this after Step 1

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;

-- Create function to check admin status
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES TABLE POLICIES

-- 1. Users can view their own profile
CREATE POLICY "Users view own profile"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (auth.uid() = id AND (is_deleted = false OR is_deleted IS NULL));

-- 2. Admins can view all profiles
CREATE POLICY "Admins view all profiles"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));

-- 3. Users can update their own profile
CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Admins can update all profiles
CREATE POLICY "Admins update all profiles"
  ON public.profiles
  FOR UPDATE TO authenticated 
  USING (is_admin(auth.uid()));

-- 5. Users can insert their own profile
CREATE POLICY "Users insert own profile"
  ON public.profiles
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- 6. Admins can delete profiles
CREATE POLICY "Admins delete profiles"
  ON public.profiles
  FOR DELETE TO authenticated 
  USING (is_admin(auth.uid()));

-- AUDIT_LOGS TABLE POLICIES

-- 1. Users can view their own audit logs
CREATE POLICY "Users view own audit logs"
  ON public.audit_logs
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

-- 2. Admins can view all audit logs
CREATE POLICY "Admins view all audit logs"
  ON public.audit_logs
  FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));

-- 3. System can insert audit logs
CREATE POLICY "System insert audit logs"
  ON public.audit_logs
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- STORAGE POLICIES

-- 1. Authenticated users can upload photos
DROP POLICY IF EXISTS "Users upload photos" ON storage.objects;
CREATE POLICY "Users upload photos"
  ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'profile-photos');

-- 2. Authenticated users can view photos
DROP POLICY IF EXISTS "Users view photos" ON storage.objects;
CREATE POLICY "Users view photos"
  ON storage.objects
  FOR SELECT TO authenticated 
  USING (bucket_id = 'profile-photos');

-- 3. Users can update photos
DROP POLICY IF EXISTS "Users update photos" ON storage.objects;
CREATE POLICY "Users update photos"
  ON storage.objects
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'profile-photos');

-- 4. Admins can manage all photos
DROP POLICY IF EXISTS "Admins manage photos" ON storage.objects;
CREATE POLICY "Admins manage photos"
  ON storage.objects
  FOR ALL TO authenticated 
  USING (bucket_id = 'profile-photos' AND is_admin(auth.uid()));

SELECT 'Step 2 Complete: RLS policies created' as status;
