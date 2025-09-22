// Debug script to check RLS policy issue
// Run this in browser console after applying the cleanup

async function debugRLSIssue() {
  console.log("=== Debugging RLS Issue ===");

  try {
    // Test 1: Check current session
    console.log("1. Checking current session...");
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();
    console.log("Session:", session);
    console.log("Session error:", sessionError);

    // Test 2: Sign up a new user
    console.log("\n2. Testing signup...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: `debug${Date.now()}@gmail.com`,
        password: "TestPass123!",
      }
    );

    if (signUpError) {
      console.error("❌ Signup error:", signUpError);
      return;
    }

    console.log("✅ Signup successful");
    console.log("User ID:", signUpData.user?.id);

    // Test 3: Check session after signup
    console.log("\n3. Checking session after signup...");
    const { data: sessionAfter, error: sessionAfterError } =
      await supabase.auth.getSession();
    console.log("Session after signup:", sessionAfter);
    console.log("User authenticated:", !!sessionAfter.session);

    // Test 4: Test auth.uid() function
    console.log("\n4. Testing auth.uid()...");
    const { data: authUid, error: authUidError } = await supabase.rpc(
      "auth.uid"
    );
    console.log("auth.uid():", authUid);
    console.log("auth.uid() error:", authUidError);

    // Test 5: Try to insert user record
    console.log("\n5. Testing user insert...");
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        first_name: "Debug",
        last_name: "User",
      })
      .select();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      console.error("Error code:", insertError.code);
      console.error("Error message:", insertError.message);
    } else {
      console.log("✅ Insert successful:", insertData);
    }

    // Test 6: Check if user exists in auth.users
    console.log("\n6. Checking auth.users...");
    const { data: authUser, error: authUserError } =
      await supabase.auth.getUser();
    console.log("Auth user:", authUser);
    console.log("Auth user error:", authUserError);
  } catch (err) {
    console.error("❌ Debug error:", err);
  }
}

// Run the debug
debugRLSIssue();
