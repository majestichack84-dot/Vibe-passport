# Vibe Passport - Setup Guide 🎵

A social audio vibe-sharing platform where users record 5-second audio clips, share photos, and discover what others around the world are feeling.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Mapbox account (free tier works)
- Stripe account (for Pro plan, optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/majestichack84-dot/Vibe-passport.git
cd Vibe-passport
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see Configuration section below).

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Configuration

### 1. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create
4. Wait for the project to initialize

#### Get Your Credentials
- In your project dashboard, go to **Settings > API**
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Set Up Database Schema
1. In Supabase, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run"

This creates:
- `users` table
- `vibes` table
- `favorites` table
- `profiles` table
- RLS policies for security
- Storage bucket for audio/photos

#### Enable OAuth (Google)
1. Go to **Authentication > Providers**
2. Click "Google"
3. Enable it
4. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)
   - Copy Client ID and Client Secret into Supabase

#### Create Storage Bucket
1. Go to **Storage**
2. Create a new bucket named `vibes`
3. Make it public
4. The schema.sql file already configures the RLS policies

---

### 2. Mapbox Setup

1. Go to [mapbox.com](https://mapbox.com)
2. Sign up / Log in
3. Go to **Account > Tokens**
4. Create a new token with default public scopes
5. Copy the token → `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`

---

### 3. Stripe Setup (Optional - for Pro Plan)

1. Go to [stripe.com](https://stripe.com)
2. Sign up / Log in
3. Go to **Developers > API Keys**
4. Copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

---

### 4. Environment Variables

Your `.env.local` should look like:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNrOW1nZDg0aTA...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890...
STRIPE_SECRET_KEY=sk_test_51234567890...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 Project Structure

```
vibe-passport/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── upload/
│   │   └── page.tsx            # Upload audio & photo
│   ├── feed/
│   │   └── page.tsx            # Auto-play feed
│   ├── map/
│   │   └── page.tsx            # World map with Mapbox
│   ├── dashboard/
│   │   └── page.tsx            # User dashboard
│   └── auth/
│       ├── login/
│       │   └── page.tsx        # Login page
│       ├── signup/
│       │   └── page.tsx        # Signup page
│       └── callback/
│           └── route.ts        # OAuth callback
├── lib/
│   └── supabase.ts             # Supabase client & types
├── supabase/
│   └── schema.sql              # Database schema
├── public/                      # Static assets
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── next.config.js              # Next.js config
└── .env.example                # Environment variables template
```

---

## 🎨 Key Features

### 1. Upload Page (`/upload`)
- Record 5-second audio using Web Audio API
- Capture photo using device camera
- Select vibe type (peace, joy, chaos, love, tired, hype)
- Capture location automatically
- Upload to Supabase Storage

### 2. Feed Page (`/feed`)
- Auto-play audio when vibe enters viewport
- Intersection Observer for auto-play detection
- Stop previous audio when new one plays
- Show play count and vibe info
- Mobile-responsive

### 3. Map Page (`/map`)
- Interactive world map using Mapbox GL
- Emoji markers for each vibe
- Click markers to view vibe details
- Play audio directly from map
- Dark theme matching app design

### 4. Dashboard (`/dashboard`)
- View user profile and stats
- Show total vibes shared
- Track uploads remaining (free tier: 3/day)
- Upgrade to Pro plan button
- Display all user vibes in grid

### 5. Authentication
- Email/password signup & login
- Google OAuth integration
- Automatic user profile creation
- Secure session management

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Adding New Pages

1. Create new directory in `app/` folder
2. Create `page.tsx` inside it
3. Add your component code

Example:
```bash
mkdir app/explore
# Then create app/explore/page.tsx
```

### Database Queries

All database operations use the Supabase client:

```typescript
import { supabase } from '@/lib/supabase'

// Fetch vibes
const { data, error } = await supabase
  .from('vibes')
  .select('*')
  .order('created_at', { ascending: false })

// Insert vibe
const { error } = await supabase
  .from('vibes')
  .insert({ user_id, audio_url, photo_url, vibe_type, location, caption })
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your repository
5. Add environment variables
6. Click "Deploy"

### Deploy to Other Platforms

The app works with any Node.js hosting:
- Netlify
- AWS Amplify
- Heroku
- DigitalOcean
- etc.

Make sure to:
1. Set all environment variables
2. Run `npm run build`
3. Set start command to `npm start`

---

## 🔐 Security

### RLS (Row Level Security)
- All tables have RLS policies enabled
- Users can only see public data and their own data
- Storage bucket secured with RLS policies

### Authentication
- Supabase Auth handles all authentication
- OAuth tokens are secure
- Passwords hashed automatically

### CORS
- Supabase storage allows public reads
- All uploads are authenticated

---

## 📱 Mobile Support

The app is fully mobile-responsive:
- Audio recording works on mobile
- Camera access works on mobile browsers
- Touch-optimized buttons
- Responsive layout on all screen sizes

---

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS on production
- Use HTTPS for local development with self-signed cert

### Audio not playing
- Check browser autoplay policies
- User interaction required for autoplay
- Check CORS headers

### Map not loading
- Verify Mapbox token is correct
- Check browser console for errors
- Ensure token has right scopes

### Database errors
- Verify RLS policies are enabled
- Check user is authenticated
- Verify foreign keys are set up correctly

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Mapbox GL Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 💬 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with details
3. Include steps to reproduce
4. Attach screenshots/videos if helpful

Happy vibe sharing! 🎵✨
