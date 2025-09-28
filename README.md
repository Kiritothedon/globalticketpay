# GlobalTicketPay.com

A modern React application for managing traffic tickets, built with Vite, TypeScript, and Tailwind CSS.

## Features

- **User Authentication**: Secure sign-up and sign-in with Supabase Auth
- **Google OAuth**: One-click login with Google
- **Dashboard**: Manage your traffic tickets
- **Responsive Design**: Works on all devices
- **Modern UI**: Built with Radix UI components and Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd traffic-ticket-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

5. Set up your Supabase database:

   - Create a new Supabase project
   - Run the SQL from `supabase-setup.sql` in your Supabase SQL editor
   - Enable Google OAuth in Authentication > Providers

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3004](http://localhost:3004) in your browser.

## Port Configuration

This project is configured to run on **port 3004** to avoid conflicts with other projects.

- **This project**: http://localhost:3004
- **Other projects**: Can use ports 3001, 3002, 3003, etc.

## Available Scripts

- `npm run dev` - Start development server on port 3004
- `npm run dev:3001` - Start on port 3001
- `npm run dev:3002` - Start on port 3002
- `npm run dev:3003` - Start on port 3003
- `npm run build` - Build for production
- `npm run preview` - Preview production build on port 3004
- `npm run lint` - Run ESLint

### Port Management

```bash
# Check port status
./scripts/port-manager.sh check

# Clear a specific port
./scripts/port-manager.sh clear 3001

# Start on specific port
./scripts/port-manager.sh start 3004
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix UI components
│   ├── Navbar.tsx      # Global navigation
│   └── ProtectedRoute.tsx # Route protection
├── hooks/              # Custom React hooks
│   └── useSupabaseAuth.ts # Authentication hook
├── lib/                # Utility libraries
│   ├── supabase.ts     # Supabase client
│   └── supabaseService.ts # Database operations
├── auth/               # Authentication pages
│   └── page.tsx        # Login/Signup page
├── dashboard/          # Dashboard pages
│   ├── page.tsx        # Main dashboard
│   └── add-ticket/     # Add ticket flow
├── home.tsx            # Landing page
└── App.tsx             # Main app component
```

## Deployment on Vercel

### Quick Deploy

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository

2. **Connect to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**:

   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

4. **Deploy**: Click "Deploy" and Vercel will automatically build and deploy your app

5. **Custom Domain**:
   - In Vercel dashboard, go to "Domains"
   - Add your custom domain: `globalticketpay.com`
   - Follow the DNS configuration instructions

### Manual Deployment

```bash
# Build the project
npm run build

# The dist/ folder contains your production build
# Upload the contents to your hosting provider
```

## Environment Variables

| Variable                 | Description                 | Required |
| ------------------------ | --------------------------- | -------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL   | Yes      |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes      |

## Supabase Setup

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project

2. **Database Setup**: Run the SQL from `supabase-setup.sql` in your Supabase SQL editor

3. **Authentication Setup**:

   - Go to Authentication > Providers
   - Enable Google OAuth
   - Configure your Google OAuth credentials
   - Set redirect URL to your Vercel domain

4. **Row Level Security**: The SQL script includes RLS policies for data security

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add pages in appropriate directories
3. Update routing in `App.tsx`
4. Add database operations in `src/lib/supabaseService.ts`

### Styling

- Use Tailwind CSS classes
- Follow the existing design system
- Use Radix UI components for complex interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
