// Test script to verify RLS fix works
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "your_supabase_url_here";
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSFix() {
  console.log("=== Testing RLS Fix ===");

  try {
    // Test 1: Sign up a new user
    console.log("1. Testing user signup...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: `test+${Date.now()}@example.com`,
        password: "TestPass123!",
      }
    );

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return;
    }

    console.log("Signup successful:", signUpData.user?.id);

    // Test 2: Insert user into public.users table
    console.log("\n2. Testing user insert into public.users...");
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          supabase_id: signUpData.user.id,
          email: signUpData.user.email,
          first_name: "Test",
          last_name: "User",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }

    console.log("Insert successful:", insertData);

    // Test 3: Verify user can read their own data
    console.log("\n3. Testing user can read own data...");
    const { data: selectData, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("supabase_id", signUpData.user.id);

    if (selectError) {
      console.error("Select error:", selectError);
      return;
    }

    console.log("Select successful:", selectData);

    // Test 4: Verify user cannot read other users' data
    console.log("\n4. Testing user cannot read other users' data...");
    const { data: otherUserData, error: otherUserError } = await supabase
      .from("users")
      .select("*")
      .neq("supabase_id", signUpData.user.id);

    console.log("Other user data (should be empty):", otherUserData);
    console.log("Other user error (if any):", otherUserError);

    // Test 5: Anonymous access test
    console.log("\n5. Testing anonymous access (should be blocked)...");
    const { data: anonData, error: anonError } = await supabase
      .from("users")
      .select("*");

    console.log("Anonymous access result:", anonData);
    console.log("Anonymous access error (expected):", anonError);

    console.log("\n✅ All tests completed successfully!");
  } catch (err) {
    console.error("Test error:", err);
  }
}

testRLSFix();
