// Test signup with debugging to see what's being sent
// Run this in browser console

async function testSignupDebug() {
  console.log("=== Testing Signup with Debug ===");

  try {
    // Test with a simple email
    const testEmail = "davee@gmail.com";
    const testPassword = "TestPass123!";

    console.log("Testing with email:", testEmail);
    console.log("Testing with password:", testPassword);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: "Dave",
          last_name: "Test",
        },
      },
    });

    if (error) {
      console.error("❌ Signup error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    } else {
      console.log("✅ Signup successful:", data);
      console.log("User ID:", data.user?.id);
      console.log("User email:", data.user?.email);
    }
  } catch (err) {
    console.error("❌ Test error:", err);
  }
}

testSignupDebug();
