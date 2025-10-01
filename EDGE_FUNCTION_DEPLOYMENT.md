# Edge Function Deployment Guide

## Problem: Edge Functions Don't Work Locally

The error you're seeing (`Preflight response is not successful. Status code: 500`) happens because:

1. **Edge Functions need to be deployed to Supabase** - They don't work in local development the same way as regular backend code
2. **Your Edge Function needs to be deployed** to your Supabase project before you can use it

## Solution: Deploy the Edge Function

### Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open a browser window to authenticate.

### Step 2: Link Your Project

```bash
supabase link --project-ref iyfnoiqnyvwjyughdfym
```

When prompted for the database password, use your Supabase project's database password.

### Step 3: Deploy the Edge Function

```bash
supabase functions deploy scrape-tickets
```

This will deploy the `scrape-tickets` Edge Function to your Supabase project.

### Step 4: Test the Deployment

Once deployed, the Edge Function will be accessible at:

```
https://iyfnoiqnyvwjyughdfym.supabase.co/functions/v1/scrape-tickets
```

You can test it locally now and it will call the deployed function!

## What Was Fixed

### 1. **Added CORS Headers** to the Edge Function

- Fixed the preflight request error
- Edge Functions need proper CORS headers to work with web apps

### 2. **Fixed Stripe Configuration**

- Updated to gracefully handle missing Stripe keys
- Added `.env.local` file template

### 3. **Updated Button Text**

- Changed "Search Shavano Park" to "Search Tickets"
- Changed component title to be more generic
- Ready for multi-county support

## Environment Variables

Make sure your `.env.local` file has:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://iyfnoiqnyvwjyughdfym.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Stripe Configuration (OPTIONAL - only for payments)
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

**Important:** You need to add your actual Supabase anonymous key to `.env.local`!

## How to Get Your Supabase Anon Key

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy the `anon` `public` key
5. Paste it in `.env.local` as `VITE_SUPABASE_ANON_KEY`

## After Deploying

Once the Edge Function is deployed:

1. **Restart your development server**: `npm run dev`
2. The scraper should now work with your real license data
3. The function will call the actual Shavano Park website

## Why Your Search Returns "No Tickets Found"

There are two possible reasons:

1. **Edge Function Not Deployed** - Deploy it using the steps above
2. **Website Structure Changed** - The Shavano Park website might have changed their HTML structure

### To Debug:

1. Deploy the function
2. Check the Supabase function logs:
   ```bash
   supabase functions logs scrape-tickets
   ```
3. Look for any scraping errors in the logs

## Future: Local Development with Supabase

If you want to test Edge Functions locally in the future:

1. **Start Docker Desktop**
2. **Start Supabase locally**:
   ```bash
   supabase start
   ```
3. **Serve functions locally**:
   ```bash
   supabase functions serve scrape-tickets
   ```

But for now, **just deploy to your remote project** - it's simpler!

## Deployment Checklist

- [ ] Login to Supabase CLI (`supabase login`)
- [ ] Link project (`supabase link --project-ref iyfnoiqnyvwjyughdfym`)
- [ ] Deploy function (`supabase functions deploy scrape-tickets`)
- [ ] Add Supabase anon key to `.env.local`
- [ ] Restart dev server (`npm run dev`)
- [ ] Test ticket search with your license data

Once all steps are complete, the search should work! 🎉
