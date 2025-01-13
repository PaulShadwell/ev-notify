/*
  # Simplify user roles policies

  1. Changes
    - Remove complex policy conditions
    - Use materialized admin check
    - Simplify role management

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Keep role-based security
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Create materialized admin check
CREATE MATERIALIZED VIEW admin_users AS
SELECT user_id
FROM user_roles
WHERE role = 'admin';

-- Create index for better performance
CREATE UNIQUE INDEX admin_users_user_id_idx ON admin_users (user_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh materialized view
CREATE TRIGGER refresh_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_admin_users();

-- Simple policies using materialized view
CREATE POLICY "Users can view roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

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