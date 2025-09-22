-- Create tickets table for traffic ticket management
-- This table stores individual traffic tickets submitted by users

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

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tickets table
-- Users can only see their own tickets
CREATE POLICY "Users can view their own tickets" ON public.tickets
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid())::uuid);

-- Users can insert their own tickets
CREATE POLICY "Users can insert their own tickets" ON public.tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid())::uuid);

-- Users can update their own tickets
CREATE POLICY "Users can update their own tickets" ON public.tickets
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid())::uuid)
  WITH CHECK (user_id = (SELECT auth.uid())::uuid);

-- Users can delete their own tickets
CREATE POLICY "Users can delete their own tickets" ON public.tickets
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid())::uuid);

-- Verify the table and policies were created
SELECT 
  tablename,
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname='public' AND tablename = 'tickets'
ORDER BY policyname;
