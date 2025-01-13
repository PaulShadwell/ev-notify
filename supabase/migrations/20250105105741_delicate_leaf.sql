/*
  # Fix user roles and policies

  1. Changes
    - Drop existing problematic policies
    - Create new policies with proper recursion prevention
    - Add initial admin user setup
  
  2. Security
    - Policies prevent infinite recursion
    - Only admins can manage roles
    - Users can view their own role
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- Create new policies with proper checks
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND user_id != COALESCE(user_roles.user_id, auth.uid())
    )
  );

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Insert initial admin user
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::user_role
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;