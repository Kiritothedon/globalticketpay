-- Fix tickets RLS policies to work with corrected users table structure
-- Users table now uses id (auth.uid()) as primary key

-- Drop existing ticket policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can delete their own tickets" ON public.tickets;

-- Create new ticket policies using the corrected user structure
CREATE POLICY "Users can view their own tickets" ON public.tickets
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid())::uuid);

CREATE POLICY "Users can insert their own tickets" ON public.tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid())::uuid);

CREATE POLICY "Users can update their own tickets" ON public.tickets
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid())::uuid)
  WITH CHECK (user_id = (SELECT auth.uid())::uuid);

CREATE POLICY "Users can delete their own tickets" ON public.tickets
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid())::uuid);

-- Verify all policies
SELECT 
  tablename,
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname='public' AND tablename IN ('users', 'tickets')
ORDER BY tablename, policyname;
