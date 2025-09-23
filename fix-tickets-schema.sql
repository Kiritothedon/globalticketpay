-- Fix tickets table schema to add missing columns
-- This script adds the missing columns that are causing the 400 error

-- Add missing columns to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS court_date date,
ADD COLUMN IF NOT EXISTS court_location text,
ADD COLUMN IF NOT EXISTS violation_code text,
ADD COLUMN IF NOT EXISTS violation_description text,
ADD COLUMN IF NOT EXISTS driver_license_number text,
ADD COLUMN IF NOT EXISTS driver_license_state text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS license_expiration_date date,
ADD COLUMN IF NOT EXISTS vehicle_color text,
ADD COLUMN IF NOT EXISTS officer_badge_number text,
ADD COLUMN IF NOT EXISTS payment_reference text;

-- Update the updated_at column to have a default value
ALTER TABLE public.tickets 
ALTER COLUMN updated_at SET DEFAULT now();

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_tickets_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tickets table
DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_tickets_updated_at_column();

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema='public' 
  AND table_name='tickets'
ORDER BY ordinal_position;
