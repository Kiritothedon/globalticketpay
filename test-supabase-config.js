// Test Supabase configuration and auth settings
// Run this in browser console

async function testSupabaseConfig() {
  console.log("=== Testing Supabase Configuration ===");

  try {
    // Test 1: Check if we can connect to Supabase
    console.log("1. Testing Supabase connection...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (connectionError) {
      console.error("❌ Connection error:", connectionError);
    } else {
      console.log("✅ Connection successful");
    }

    // Test 2: Check auth settings
    console.log("\n2. Testing auth settings...");
    console.log("Supabase URL:", supabase.supabaseUrl);
    console.log(
      "Supabase Key (first 10 chars):",
      supabase.supabaseKey?.substring(0, 10) + "..."
    );

    // Test 3: Try a simple signup with minimal data
    console.log("\n3. Testing minimal signup...");
    const { data: signupData, error: signupError } = await supabase.auth.signUp(
      {
        email: "test@example.com",
        password: "password123",
      }
    );

    if (signupError) {
      console.error("❌ Minimal signup error:", signupError);
      console.error("Error details:", {
        code: signupError.code,
        message: signupError.message,
        details: signupError.details,
        hint: signupError.hint,
      });
    } else {
      console.log("✅ Minimal signup successful:", signupData);
    }

    // Test 4: Check if email confirmation is required
    console.log("\n4. Checking email confirmation...");
    if (signupData?.user && !signupData.user.email_confirmed_at) {
      console.log(
        "⚠️ Email confirmation required - user needs to confirm email"
      );
      console.log("User confirmed:", signupData.user.email_confirmed_at);
    }
  } catch (err) {
    console.error("❌ Config test error:", err);
  }
}

testSupabaseConfig();
