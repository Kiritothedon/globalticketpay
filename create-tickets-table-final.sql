-- Create comprehensive tickets table for traffic ticket management
-- This includes all fields for manual entry and image upload

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS public.tickets CASCADE;

-- Create tickets table
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic ticket information
  ticket_number text NOT NULL,
  violation_date date,
  due_date date NOT NULL,
  amount decimal(10,2) NOT NULL,
  
  -- Location information
  state text NOT NULL,
  county text NOT NULL,
  court text NOT NULL,
  
  -- Violation details
  violation text NOT NULL,
  violation_code text,
  violation_description text,
  
  -- Driver information
  driver_license_number text,
  driver_license_state text,
  date_of_birth date,
  license_expiration_date date,
  
  -- Vehicle information
  vehicle_plate text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_color text,
  
  -- Officer information
  officer_name text,
  officer_badge_number text,
  
  -- Status and payment
  status text NOT NULL CHECK (status IN ('pending', 'overdue', 'paid', 'disputed', 'dismissed', 'court_date_scheduled')),
  payment_method text,
  payment_date date,
  payment_reference text,
  
  -- Image upload
  ticket_image_url text,
  ticket_image_path text,
  
  -- Additional information
  notes text,
  court_date date,
  court_location text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON public.tickets(due_date);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_state ON public.tickets(state);
CREATE INDEX IF NOT EXISTS idx_tickets_violation_date ON public.tickets(violation_date);

-- Enable Row Level Security
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON public.tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema='public' 
  AND table_name = 'tickets'
ORDER BY ordinal_position;

-- Verify RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname='public' 
  AND tablename='tickets'
ORDER BY policyname;
