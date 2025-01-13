-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles table
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing policies to use is_admin() function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can view all messages"
  ON chat_messages FOR SELECT
  USING (
    is_admin() OR 
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

-- Insert initial admin user (replace with actual admin user ID)
-- INSERT INTO user_roles (user_id, role) VALUES 
--   ('ADMIN_USER_ID', 'admin');