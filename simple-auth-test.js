// Simple Supabase auth test - only logs auth results
// Run this in browser console

console.log("=== Simple Auth Test ===");

// Clear any existing auth state first
supabase.auth.signOut().then(() => {
  console.log("✅ Cleared auth state");

  // Test signup
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  console.log(`\n📧 Testing signup with: ${testEmail}`);

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
      console.log("\n🔐 SIGNUP RESULT:");
      console.log("Data:", data);
      console.log("Error:", error);

      if (error) {
        console.log("❌ Signup failed:", error.message);
      } else {
        console.log("✅ Signup successful");

        // Test signin after 2 seconds
        setTimeout(() => {
          console.log(`\n🔑 Testing signin with: ${testEmail}`);

          supabase.auth
            .signInWithPassword({
              email: testEmail,
              password: testPassword,
            })
            .then(({ data, error }) => {
              console.log("\n🔐 SIGNIN RESULT:");
              console.log("Data:", data);
              console.log("Error:", error);

              if (error) {
                console.log("❌ Signin failed:", error.message);
              } else {
                console.log("✅ Signin successful");
              }
            });
        }, 2000);
      }
    });
});
