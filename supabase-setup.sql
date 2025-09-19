-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  created_at timestamp DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ticket_number text NOT NULL,
  county text NOT NULL,
  violation text NOT NULL,
  amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'overdue', 'paid')),
  court text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = supabase_id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = supabase_id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = supabase_id);

-- Create RLS policies for tickets table
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own tickets" ON tickets
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE supabase_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own tickets" ON tickets
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_id = auth.uid()
    )
  );
