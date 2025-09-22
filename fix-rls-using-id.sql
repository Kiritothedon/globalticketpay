-- Fix RLS policies using the existing 'id' column
-- This assumes your users.id should match auth.uid()

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.users;
DROP POLICY IF EXISTS "User select own" ON public.users;
DROP POLICY IF EXISTS "User insert own" ON public.users;
DROP POLICY IF EXISTS "User update own" ON public.users;
DROP POLICY IF EXISTS "User delete own" ON public.users;

-- Create RLS policies using the existing 'id' column
CREATE POLICY "User select own" ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid())::uuid = id);

CREATE POLICY "User insert own" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid())::uuid = id);

CREATE POLICY "User update own" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid())::uuid = id)
  WITH CHECK ((SELECT auth.uid())::uuid = id);

CREATE POLICY "User delete own" ON public.users
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid())::uuid = id);

-- Verify policies were created
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname='public' AND tablename='users';
