-- Complete database setup for traffic ticket app
-- This script fixes the RLS issues and creates the tickets table

-- ==============================================
-- PART 1: Fix users table RLS policies
-- ==============================================

-- Ensure RLS is enabled on users table
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

-- Create RLS policies using the existing 'id' column (which should match auth.uid())
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

-- ==============================================
-- PART 2: Create tickets table
-- ==============================================

-- Create tickets table for traffic ticket management
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticket_number text NOT NULL,
  county text NOT NULL,
  violation text NOT NULL,
  amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'overdue', 'paid', 'disputed', 'dismissed')),
  court text NOT NULL,
  violation_date date,
  officer_name text,
  vehicle_plate text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  notes text,
  payment_method text,
  payment_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON public.tickets(due_date);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets(ticket_number);

-- Enable Row Level Security on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tickets table
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

-- ==============================================
-- PART 3: Verify setup
-- ==============================================

-- Verify all policies were created correctly
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

-- Show table structures
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema='public' 
  AND table_name IN ('users', 'tickets')
ORDER BY table_name, ordinal_position;
