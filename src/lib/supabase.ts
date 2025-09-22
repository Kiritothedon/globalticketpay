import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "your_supabase_url_here";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Expose supabase client globally for browser console testing
if (typeof window !== "undefined") {
  (window as any).supabase = supabase;
}

// Database types
export interface User {
  id: string; // This is the auth.uid() - the primary key
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
  status: "pending" | "overdue" | "paid" | "disputed" | "dismissed";
  court: string;
  violation_date?: string;
  officer_name?: string;
  vehicle_plate?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  notes?: string;
  payment_method?: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}
