-- Create user_security_settings table for real-time security preferences
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_auth BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  session_management BOOLEAN DEFAULT true,
  login_notifications BOOLEAN DEFAULT true,
  device_tracking BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own security settings
CREATE POLICY "Users can manage their own security settings" ON user_security_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_security_settings_updated_at 
  BEFORE UPDATE ON user_security_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 