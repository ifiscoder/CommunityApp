-- COMPLETE RLS POLICY SYSTEM - CLEAR & SIMPLE
-- Based on actual app usage scenarios

-- First, enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SCENARIO 1: USER REGISTRATION
-- When: New user signs up
-- Who: The user themselves
-- What: Create their own profile
-- ============================================
CREATE POLICY "scenario_1_user_can_create_own_profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can ONLY create profile with THEIR auth ID
    auth.uid() = id
  );

-- ============================================
-- SCENARIO 2: USER VIEWS OWN PROFILE
-- When: User opens "My Profile" screen
-- Who: The user themselves
-- What: See their own data
-- ============================================
CREATE POLICY "scenario_2_user_can_view_own_profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- User can ONLY see their own profile
    auth.uid() = id
  );

-- ============================================
-- SCENARIO 3: USER EDITS OWN PROFILE
-- When: User clicks "Edit Profile"
-- Who: The user themselves
-- What: Update their own data
-- ============================================
CREATE POLICY "scenario_3_user_can_edit_own_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Can only update if it's their profile
    auth.uid() = id
  )
  WITH CHECK (
    -- Must remain their profile after update
    auth.uid() = id
  );

-- ============================================
-- SCENARIO 4: ADMIN VIEWS ALL PROFILES
-- When: Admin opens "Admin Dashboard"
-- Who: Admin users only
-- What: See ALL members (for management)
-- ============================================
CREATE POLICY "scenario_4_admin_can_view_all_profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Check if current user is admin by looking at their own profile
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SCENARIO 5: ADMIN EDITS ANY PROFILE
-- When: Admin approves/edits a member
-- Who: Admin users only
-- What: Update ANY profile
-- ============================================
CREATE POLICY "scenario_5_admin_can_edit_any_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Check if current user is admin
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SCENARIO 6: ADMIN DELETES PROFILE
-- When: Admin removes a member
-- Who: Admin users only
-- What: Delete any profile
-- ============================================
CREATE POLICY "scenario_6_admin_can_delete_profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    -- Only admins can delete
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  'RLS Policies Created Successfully!' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'profiles';

-- Show all policies
SELECT 
  policyname as scenario,
  cmd as operation,
  'See SQL file for details' as description
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
