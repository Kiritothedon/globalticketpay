// Test email confirmation status
// Run this in browser console after signing up

console.log("=== Email Confirmation Test ===");

// Check current session
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log("Current session:", session);
  console.log("Session error:", error);

  if (session?.user) {
    console.log("User email confirmed:", session.user.email_confirmed_at);
    console.log("User email:", session.user.email);
    console.log("User ID:", session.user.id);
  }
});

// Check auth state
supabase.auth.getUser().then(({ data: { user }, error }) => {
  console.log("Current user:", user);
  console.log("User error:", error);

  if (user) {
    console.log("User email confirmed:", user.email_confirmed_at);
    console.log("User email:", user.email);
  }
});

// Test signin with confirmed email
console.log("\n=== Testing Signin ===");
console.log("Try signing in with your confirmed email and password");
