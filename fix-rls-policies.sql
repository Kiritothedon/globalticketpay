-- Fix RLS policies for public.users table
-- This script addresses the RLS issue when creating new users

-- Step 1: Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.users;

-- Step 3: Create comprehensive RLS policies for users table
-- These policies ensure users can only access their own data

CREATE POLICY "User select own" ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid())::uuid = supabase_id);

CREATE POLICY "User insert own" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid())::uuid = supabase_id);

CREATE POLICY "User update own" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid())::uuid = supabase_id)
  WITH CHECK ((SELECT auth.uid())::uuid = supabase_id);

CREATE POLICY "User delete own" ON public.users
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid())::uuid = supabase_id);

-- Step 4: Verify policies were created
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname='public' AND tablename='users';

-- Step 5: Create index for better performance on RLS checks
CREATE INDEX IF NOT EXISTS idx_users_supabase_id_auth ON users(supabase_id) WHERE supabase_id IS NOT NULL;
