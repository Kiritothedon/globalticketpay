// Debug script to check database structure and RLS policies
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "your_supabase_url_here";
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabase() {
  console.log("=== Database Debug ===");

  try {
    // 1. Check if we can connect
    console.log("1. Testing connection...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (connectionError) {
      console.error("Connection error:", connectionError);
      return;
    }
    console.log("✅ Connection successful");

    // 2. Try to sign up first
    console.log("\n2. Testing signup...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: `debug+${Date.now()}@example.com`,
        password: "TestPass123!",
      }
    );

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return;
    }

    console.log("✅ Signup successful");
    console.log("User ID:", signUpData.user?.id);
    console.log("User email:", signUpData.user?.email);

    // 3. Check current session
    console.log("\n3. Checking session...");
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    console.log("Session:", sessionData.session);
    console.log("User from session:", sessionData.session?.user);

    // 4. Try to get auth.uid() equivalent
    console.log("\n4. Testing auth.uid()...");
    const { data: authTest, error: authError } = await supabase.rpc("auth.uid");
    console.log("auth.uid() result:", authTest, authError);

    // 5. Try a simple select to see what happens
    console.log("\n5. Testing SELECT on users table...");
    const { data: selectData, error: selectError } = await supabase
      .from("users")
      .select("*")
      .limit(1);
    console.log("Select result:", selectData, selectError);

    // 6. Try insert with detailed error info
    console.log("\n6. Testing INSERT on users table...");
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: signUpData.user.id,
          email: signUpData.user.email,
          first_name: "Debug",
          last_name: "User",
        },
      ])
      .select();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      console.error("Error code:", insertError.code);
      console.error("Error message:", insertError.message);
      console.error("Error details:", insertError.details);
      console.error("Error hint:", insertError.hint);
    } else {
      console.log("✅ Insert successful:", insertData);
    }
  } catch (err) {
    console.error("Debug error:", err);
  }
}

debugDatabase();
