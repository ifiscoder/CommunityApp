-- Update storage bucket to enforce 500KB limit
UPDATE storage.buckets
SET file_size_limit = 524288  -- 512KB (slightly more than 500KB for metadata)
WHERE id = 'profile-photos';

-- Add soft delete columns if not exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create views for active and deleted members
DROP VIEW IF EXISTS public.active_members CASCADE;
DROP VIEW IF EXISTS public.deleted_members CASCADE;

CREATE VIEW public.active_members AS
SELECT *
FROM public.profiles
WHERE is_deleted = false OR is_deleted IS NULL;

CREATE VIEW public.deleted_members AS
SELECT *
FROM public.profiles
WHERE is_deleted = true;

-- Create function to soft delete member
CREATE OR REPLACE FUNCTION soft_delete_member(member_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET is_deleted = true, deleted_at = NOW(), updated_at = NOW()
  WHERE id = member_id;
  
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, created_at)
  VALUES (member_id, 'MEMBER_DELETED', 'profiles', member_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to restore member
CREATE OR REPLACE FUNCTION restore_member(member_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET is_deleted = false, deleted_at = NULL, updated_at = NOW()
  WHERE id = member_id;
  
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, created_at)
  VALUES (member_id, 'MEMBER_RESTORED', 'profiles', member_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify
SELECT 'Storage bucket updated to 512KB' as status;
SELECT 'Soft delete columns added' as status;
SELECT 'Views created: active_members, deleted_members' as status;
