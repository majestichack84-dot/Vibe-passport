-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  location TEXT,
  avatar_url TEXT,
  tier TEXT CHECK (tier IN ('free', 'pro')) DEFAULT 'free',
  uploads_today INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vibes table
CREATE TABLE vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  vibe_type TEXT NOT NULL CHECK (vibe_type IN ('peace', 'joy', 'chaos', 'love', 'tired', 'hype')),
  location JSONB DEFAULT '{"city": "Unknown", "country_code": "XX", "latitude": 0, "longitude": 0}'::jsonb,
  caption TEXT,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vibe_id UUID NOT NULL REFERENCES vibes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vibe_id)
);

-- Create profiles table (for user additional info)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  website TEXT,
  twitter TEXT,
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_vibes_user_id ON vibes(user_id);
CREATE INDEX idx_vibes_created_at ON vibes(created_at DESC);
CREATE INDEX idx_vibes_vibe_type ON vibes(vibe_type);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_vibe_id ON favorites(vibe_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for vibes table
CREATE POLICY "Anyone can view vibes" ON vibes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own vibes" ON vibes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vibes" ON vibes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vibes" ON vibes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for favorites table
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for profiles table
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets
INSERT INTO storage.buckets (id, name)
VALUES ('vibes', 'vibes')
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage
CREATE POLICY "Anyone can view vibes" ON storage.objects
  FOR SELECT USING (bucket_id = 'vibes');

CREATE POLICY "Users can upload vibes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vibes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own vibes" ON storage.objects
  FOR DELETE USING (bucket_id = 'vibes' AND auth.uid()::text = (storage.foldername(name))[1]);
