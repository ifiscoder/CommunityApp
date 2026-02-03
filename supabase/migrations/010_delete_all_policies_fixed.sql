-- DELETE ALL RLS POLICIES - FIXED VERSION
-- This handles dependencies properly

-- Step 1: Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete ALL policies on ALL tables
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Delete policies on profiles
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
  END LOOP;
  
  -- Delete policies on audit_logs
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'audit_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.audit_logs', policy_record.policyname);
  END LOOP;
  
  -- Delete policies on storage.objects
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
  END LOOP;
END $$;

-- Step 3: Now delete the functions (no more dependencies)
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS is_user_admin(UUID);

-- Step 4: Verify
SELECT 'All policies and functions deleted!' as status;

-- Show any remaining policies (should be empty)
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'audit_logs', 'objects')
ORDER BY tablename;
