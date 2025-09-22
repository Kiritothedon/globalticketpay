// Test script to verify the signup fix works end-to-end
// Run this in browser console after the changes are applied

async function testSignupFix() {
  console.log("=== Testing Signup Fix ===");

  try {
    // Test 1: Sign up a new user
    console.log("1. Testing user signup...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: `test${Date.now()}@gmail.com`,
        password: "TestPass123!",
      }
    );

    if (signUpError) {
      console.error("❌ Signup error:", signUpError);
      return;
    }

    console.log("✅ Signup successful");
    console.log("User ID:", signUpData.user?.id);
    console.log("User email:", signUpData.user?.email);

    // Test 2: Check if user was inserted into public.users
    console.log("\n2. Checking if user was inserted into public.users...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", signUpData.user.id);

    if (userError) {
      console.error("❌ Error fetching user from public.users:", userError);
    } else if (userData && userData.length > 0) {
      console.log("✅ User found in public.users:", userData[0]);
    } else {
      console.log("❌ User not found in public.users");
    }

    // Test 3: Verify user can only see their own data
    console.log("\n3. Testing user can only see their own data...");
    const { data: allUsers, error: allUsersError } = await supabase
      .from("users")
      .select("*");

    if (allUsersError) {
      console.error("❌ Error fetching all users:", allUsersError);
    } else {
      console.log("✅ Users visible to current user:", allUsers);
      console.log(
        "Should only see own data:",
        allUsers.length === 1 && allUsers[0].id === signUpData.user.id
      );
    }

    // Test 4: Test auth.uid() function
    console.log("\n4. Testing auth.uid()...");
    const { data: authUid, error: authUidError } = await supabase.rpc(
      "auth.uid"
    );
    console.log("auth.uid():", authUid);
    console.log("Should match user ID:", authUid === signUpData.user.id);

    // Test 5: Test sign out and sign in
    console.log("\n5. Testing sign out...");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("❌ Sign out error:", signOutError);
    } else {
      console.log("✅ Sign out successful");
    }

    // Test 6: Test sign in
    console.log("\n6. Testing sign in...");
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: signUpData.user.email,
        password: "TestPass123!",
      });

    if (signInError) {
      console.error("❌ Sign in error:", signInError);
    } else {
      console.log("✅ Sign in successful");
      console.log("User ID:", signInData.user?.id);
    }

    console.log("\n🎉 All tests completed!");
  } catch (err) {
    console.error("❌ Test error:", err);
  }
}

// Run the test
testSignupFix();
