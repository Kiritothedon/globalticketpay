// Simple test to check if we can insert a user record
// Run this AFTER you've signed up and are logged in

async function testSimpleInsert() {
  console.log("=== Simple Insert Test ===");

  try {
    // Check if we're authenticated
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log("❌ Not authenticated. Please sign up first.");
      return;
    }

    console.log("✅ Authenticated as:", session.session.user.email);
    console.log("User ID:", session.session.user.id);

    // Test auth.uid()
    const { data: authUid } = await supabase.rpc("auth.uid");
    console.log("auth.uid():", authUid);

    // Try to insert
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: session.session.user.id,
        email: session.session.user.email,
        first_name: "Test",
        last_name: "User",
      })
      .select();

    if (error) {
      console.error("❌ Insert failed:", error);
    } else {
      console.log("✅ Insert successful:", data);
    }
  } catch (err) {
    console.error("❌ Test error:", err);
  }
}

testSimpleInsert();
