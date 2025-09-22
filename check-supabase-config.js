// Check Supabase configuration
// Run this in browser console

console.log("=== Supabase Configuration Check ===");

// Check environment variables
console.log("1. Environment Variables:");
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "VITE_SUPABASE_ANON_KEY:",
  import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + "..."
);

// Check Supabase client
console.log("\n2. Supabase Client:");
console.log("Supabase URL:", supabase.supabaseUrl);
console.log("Supabase Key:", supabase.supabaseKey?.substring(0, 20) + "...");

// Test basic connection
console.log("\n3. Testing Connection:");
supabase
  .from("users")
  .select("count")
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error("❌ Connection error:", error);
    } else {
      console.log("✅ Connection successful");
    }
  });

// Check current auth state
console.log("\n4. Current Auth State:");
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log("Session:", session);
  console.log("Session error:", error);
});

// Instructions for Supabase dashboard
console.log("\n5. Supabase Dashboard Settings to Check:");
console.log("- Go to Authentication > Settings");
console.log("- Site URL should be: http://localhost:3000");
console.log("- Redirect URLs should include: http://localhost:3000/**");
console.log("- Email confirmations should be DISABLED");
console.log("- Confirm email change should be DISABLED");
