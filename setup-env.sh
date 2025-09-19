#!/bin/bash

# Create .env.local file with placeholder values
cat > .env.local << EOF
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_placeholder_key_replace_with_your_actual_key

# Supabase Database  
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder_anon_key_replace_with_your_actual_key
EOF

echo "Created .env.local with placeholder values"
echo "Please replace the placeholder values with your actual Clerk and Supabase credentials"
echo ""
echo "To get your credentials:"
echo "1. Clerk: Go to https://clerk.com, create an app, and copy your publishable key"
echo "2. Supabase: Go to https://supabase.com, create a project, and copy your URL and anon key"
echo ""
echo "Then restart the dev server with: npm run dev"
