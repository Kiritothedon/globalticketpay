// Clean auth test - run this in browser console
// This will clear all auth state and test fresh

console.log("=== Clean Auth Test ===");

// Step 1: Clear all auth state
console.log("1. Clearing auth state...");
supabase.auth.signOut().then(() => {
  console.log("✅ Auth state cleared");

  // Step 2: Test fresh signup
  console.log("\n2. Testing fresh signup...");
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  supabase.auth
    .signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: "Test",
          last_name: "User",
        },
      },
    })
    .then(({ data, error }) => {
      if (error) {
        console.error("❌ Signup error:", error);
      } else {
        console.log("✅ Signup successful:", data.user);

        // Step 3: Test immediate signin
        console.log("\n3. Testing immediate signin...");
        setTimeout(() => {
          supabase.auth
            .signInWithPassword({
              email: testEmail,
              password: testPassword,
            })
            .then(({ data, error }) => {
              if (error) {
                console.error("❌ Signin error:", error);
              } else {
                console.log("✅ Signin successful:", data.user);
                console.log("✅ Session:", data.session);
              }
            });
        }, 2000);
      }
    });
});
