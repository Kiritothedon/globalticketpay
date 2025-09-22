// Test signin only - run this in browser console
// Use the email/password from a successful signup

console.log("=== Signin Test ===");

// Replace with your actual email/password from signup
const testEmail = "your-email@example.com"; // Replace with actual email
const testPassword = "your-password"; // Replace with actual password

console.log(`🔑 Testing signin with: ${testEmail}`);

// Clear any existing session first
supabase.auth.signOut().then(() => {
  console.log("✅ Cleared existing session");

  // Test signin
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
        console.log("User:", data.user?.email);
        console.log("Session:", !!data.session);
      }
    });
});
