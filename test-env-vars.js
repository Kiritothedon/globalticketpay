// Test environment variables
// Run this in browser console

console.log("=== Environment Variables Test ===");

console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

// Check if they're using fallback values
if (import.meta.env.VITE_SUPABASE_URL === "your_supabase_url_here") {
  console.error(
    "❌ VITE_SUPABASE_URL is using fallback value - you need to set your actual Supabase URL"
  );
}

if (import.meta.env.VITE_SUPABASE_ANON_KEY === "your_supabase_anon_key_here") {
  console.error(
    "❌ VITE_SUPABASE_ANON_KEY is using fallback value - you need to set your actual Supabase anon key"
  );
}

if (
  import.meta.env.VITE_SUPABASE_URL !== "your_supabase_url_here" &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== "your_supabase_anon_key_here"
) {
  console.log("✅ Environment variables are set correctly");
}
