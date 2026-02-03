-- DELETE ALL RLS POLICIES COMPLETELY
-- Run this to remove all policies from profiles table

-- Step 1: Disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete ALL policies on profiles table
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
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
END $$;

-- Step 3: Also delete any functions we created
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS is_user_admin(UUID);

-- Step 4: Verify all policies are gone
SELECT 
  'All policies deleted!' as status,
  COUNT(*) as remaining_policies
FROM pg_policies 
WHERE tablename = 'profiles';

-- Show confirmation
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'profiles';
