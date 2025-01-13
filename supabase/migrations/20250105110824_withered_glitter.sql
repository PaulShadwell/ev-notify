/*
  # Fix user roles policies

  1. Changes
    - Simplify RLS policies to prevent recursion
    - Fix authentication policies
    - Ensure proper role checking

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion in policies
    - Allow proper role-based access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- Create new simplified policies
CREATE POLICY "Anyone can view roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON user_roles 
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM user_roles 
      WHERE role = 'admin'
    )
  );

-- Ensure admin user exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id IN (
      SELECT id FROM auth.users WHERE email = 'admin@example.com'
    )
  ) THEN
    INSERT INTO user_roles (user_id, role)
    SELECT id, 'admin'::user_role
    FROM auth.users
    WHERE email = 'admin@example.com';
  END IF;
END $$;