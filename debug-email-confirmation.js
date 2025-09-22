// Debug email confirmation and session issues
// Run this in browser console

console.log("=== Email Confirmation Debug ===");

// Check if we have a current session
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log("1. Current session:", session);
  console.log("Session error:", error);

  if (session?.user) {
    console.log("User details:");
    console.log("- Email:", session.user.email);
    console.log("- Email confirmed:", session.user.email_confirmed_at);
    console.log("- User ID:", session.user.id);
    console.log("- Created at:", session.user.created_at);
  }
});

// Check current user
supabase.auth.getUser().then(({ data: { user }, error }) => {
  console.log("\n2. Current user:", user);
  console.log("User error:", error);

  if (user) {
    console.log("User details:");
    console.log("- Email:", user.email);
    console.log("- Email confirmed:", user.email_confirmed_at);
    console.log("- User ID:", user.id);
  }
});

// Check if user exists in our database
supabase.auth.getUser().then(({ data: { user } }) => {
  if (user) {
    console.log("\n3. Checking user in database...");
    supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        console.log("Database user:", data);
        console.log("Database error:", error);
      });
  }
});

// Test signin with a known confirmed email
console.log("\n4. To test signin, try:");
console.log(
  "supabase.auth.signInWithPassword({ email: 'your-email@example.com', password: 'your-password' })"
);
