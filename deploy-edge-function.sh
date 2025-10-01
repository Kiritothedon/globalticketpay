#!/bin/bash

echo "🚀 Deploying Edge Function to Supabase"
echo "======================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed"
echo ""

# Check if logged in
echo "📝 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo "Running: supabase login"
    supabase login
    if [ $? -ne 0 ]; then
        echo "❌ Login failed"
        exit 1
    fi
fi

echo "✅ Logged in to Supabase"
echo ""

# Link project
echo "🔗 Linking to Supabase project..."
PROJECT_REF="iyfnoiqnyvwjyughdfym"

if [ ! -f "supabase/.temp/project-ref" ] || [ "$(cat supabase/.temp/project-ref)" != "$PROJECT_REF" ]; then
    echo "Running: supabase link --project-ref $PROJECT_REF"
    supabase link --project-ref $PROJECT_REF
    if [ $? -ne 0 ]; then
        echo "❌ Project linking failed"
        exit 1
    fi
fi

echo "✅ Project linked"
echo ""

# Deploy function
echo "📦 Deploying Edge Function..."
echo "Running: supabase functions deploy scrape-tickets"
echo ""

supabase functions deploy scrape-tickets

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Edge Function deployed successfully!"
echo ""
echo "🎉 Next steps:"
echo "1. Make sure your .env.local has the correct VITE_SUPABASE_ANON_KEY"
echo "2. Restart your dev server: npm run dev"
echo "3. Test the ticket search with your license data"
echo ""
echo "📋 To view function logs:"
echo "   supabase functions logs scrape-tickets"
echo ""
echo "🌐 Your Edge Function is available at:"
echo "   https://$PROJECT_REF.supabase.co/functions/v1/scrape-tickets"
echo ""

