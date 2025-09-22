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
  
  // Basic ticket information
  ticket_number: string;
  violation_date?: string;
  due_date: string;
  amount: number;
  
  // Location information
  state: string;
  county: string;
  court: string;
  
  // Violation details
  violation: string;
  violation_code?: string;
  violation_description?: string;
  
  // Driver information
  driver_license_number?: string;
  driver_license_state?: string;
  date_of_birth?: string;
  license_expiration_date?: string;
  
  // Vehicle information
  vehicle_plate?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  
  // Officer information
  officer_name?: string;
  officer_badge_number?: string;
  
  // Status and payment
  status: "pending" | "overdue" | "paid" | "disputed" | "dismissed" | "court_date_scheduled";
  payment_method?: string;
  payment_date?: string;
  payment_reference?: string;
  
  // Image upload
  ticket_image_url?: string;
  ticket_image_path?: string;
  
  // Additional information
  notes?: string;
  court_date?: string;
  court_location?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}
