-- EMERGENCY FIX: RLS Policy Error
-- Run this if you get "new row violates row-level security policy"

-- Step 1: Temporarily disable RLS to check what's happening
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Check if any profiles exist
SELECT COUNT(*) as total_profiles FROM public.profiles;
SELECT COUNT(*) as total_users FROM auth.users;

-- Step 3: Check if the user has a profile
SELECT 
  au.id as auth_id,
  au.email,
  p.id as profile_id,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'admin@community.local';

-- Step 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop ALL policies and recreate with correct logic
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable select for users" ON public.profiles;

-- Step 6: Create SIMPLE working policies

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "Enable insert for authenticated"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to SELECT their own profile
CREATE POLICY "Enable select for authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to UPDATE their own profile
CREATE POLICY "Enable update for authenticated"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to do everything
CREATE POLICY "Enable all for admins"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 7: Verify
SELECT 'Policies fixed!' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
