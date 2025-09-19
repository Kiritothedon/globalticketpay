import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "your_supabase_url_here";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here";

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
