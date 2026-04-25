CREATE TABLE IF NOT EXISTS line_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  line_uid TEXT NOT NULL UNIQUE,
  display_name TEXT,
  picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_line_profiles_line_uid ON line_profiles(line_uid);
CREATE INDEX idx_line_profiles_user_id ON line_profiles(user_id);

ALTER TABLE line_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile" ON line_profiles
  FOR SELECT USING (auth.uid() = user_id);
