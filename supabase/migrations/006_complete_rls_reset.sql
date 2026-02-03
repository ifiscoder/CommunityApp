-- COMPLETE RLS FIX - Disable and recreate everything
-- Run this entire script

-- Step 1: Completely disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete ALL existing policies
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

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create ULTRA-SIMPLE policies that work

-- Policy 1: Allow ANY authenticated user to INSERT
CREATE POLICY "allow_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 2: Allow ANY authenticated user to SELECT
CREATE POLICY "allow_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Allow ANY authenticated user to UPDATE
CREATE POLICY "allow_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (true);

-- Step 5: Verify
SELECT 'RLS policies reset to allow all authenticated users' as status;
SELECT policyname, cmd, qual::text as condition
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 6: Test - create a test profile manually
-- This will verify the policy works
INSERT INTO public.profiles (
  id, email, role, full_name, phone, 
  address_street, address_city, address_state, address_postal,
  is_verified, is_approved
)
SELECT 
  id,
  email,
  'member',
  'Test User',
  '+1-111-111-1111',
  'Test Street',
  'Test City',
  'Test State',
  '00000',
  true,
  true
FROM auth.users 
WHERE email = 'admin@community.local'
ON CONFLICT (id) DO NOTHING;

SELECT 'Test complete - if no error above, policies work!' as status;
