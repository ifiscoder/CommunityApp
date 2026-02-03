-- FIX INFINITE RECURSION IN RLS POLICIES
-- The issue: Checking 'profiles' table inside a policy ON 'profiles' table causes recursion

-- Step 1: Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
  END LOOP;
END $$;

-- Step 3: Create function to check admin status WITHOUT recursion
-- This function uses auth.users metadata instead of profiles table
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check admin role from JWT token (user metadata)
  -- This avoids querying the profiles table
  RETURN (
    SELECT COALESCE(
      raw_user_meta_data->>'role' = 'admin',
      false
    )
    FROM auth.users
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create FIXED policies (no recursion)

-- Policy 1: User can create own profile
CREATE POLICY "user_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: User can view own profile
CREATE POLICY "user_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: User can update own profile
CREATE POLICY "user_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy 4: Admin can view all (uses auth.users, not profiles)
CREATE POLICY "admin_select_all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- Policy 5: Admin can update all
CREATE POLICY "admin_update_all"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- Policy 6: Admin can delete
CREATE POLICY "admin_delete"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- Step 6: Set admin role in auth.users metadata
-- Run this after creating admin user:
UPDATE auth.users
SET raw_user_meta_data = '{"role": "admin"}'
WHERE email = 'admin@community.local';

-- Step 7: Verify
SELECT 'Fixed! No more recursion.' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
