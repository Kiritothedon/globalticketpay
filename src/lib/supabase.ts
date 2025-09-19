import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iyfnoiqnyvwjyughdfym.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Zm5vaXFueXZ3anl1Z2hkZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTQ5NjIsImV4cCI6MjA3MzgzMDk2Mn0.klFmX7GPQ8rq93m5KAa5_3E2L_3ezE4g-Gcmo4ZTM-8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  supabase_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  ticket_number: string;
  county: string;
  violation: string;
  amount: number;
  due_date: string;
  status: "pending" | "overdue" | "paid";
  court: string;
  created_at: string;
  updated_at: string;
}
