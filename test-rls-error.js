// Test script to reproduce RLS error
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "your_supabase_url_here";
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSError() {
  console.log("=== Testing RLS Error Reproduction ===");

  try {
    // 1) Sign up to reproduce the error
    console.log("1. Attempting signup...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: "test+debug@example.com",
        password: "TestPass123!",
      }
    );
    console.log("signUpError:", signUpError);
    console.log("signUpData:", signUpData);

    // 2) If you have code that auto-inserts into public.users after signUp, run it and capture error:
    console.log("\n2. Testing user insert...");
    const session = (await supabase.auth.getSession()).data?.session;
    const user = session?.user ?? (supabase.auth?.user && supabase.auth.user());
    console.log("session user:", user);

    // Test the current insert method (using supabase_id)
    const { data, error } = await supabase.from("users").insert([
      {
        supabase_id: user?.id ?? null, // using supabase_id as per current code
        email: user?.email ?? "test+debug@example.com",
        first_name: "Test",
        last_name: "User",
      },
    ]);
    console.log("insert error:", error);
    console.log("insert data:", data);
  } catch (err) {
    console.error("Test error:", err);
  }
}

testRLSError();
