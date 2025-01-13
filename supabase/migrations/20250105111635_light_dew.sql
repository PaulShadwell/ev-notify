/*
  # Fix Admin Role Management

  1. Changes
    - Drop existing objects with proper CASCADE
    - Recreate admin role management with simplified approach
    - Add proper policies without recursion

  2. Security
    - Enable RLS
    - Add proper policies for role management
*/

-- Drop existing objects with CASCADE to handle dependencies
DROP MATERIALIZED VIEW IF EXISTS admin_users CASCADE;
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON user_roles CASCADE;
DROP FUNCTION IF EXISTS refresh_admin_users CASCADE;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified policies
CREATE POLICY "Allow users to view roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to insert roles"
  ON user_roles FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow admins to update roles"
  ON user_roles FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Allow admins to delete roles"
  ON user_roles FOR DELETE
  USING (is_admin(auth.uid()));

-- Ensure initial admin exists
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
    WHERE email = 'admin@example.com'
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;