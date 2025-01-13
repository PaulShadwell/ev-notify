/*
  # Fix accessories management policies

  1. Changes
    - Drop existing policies
    - Add proper RLS policies for accessories management
    - Ensure admin check function exists
    - Add policies for all CRUD operations

  2. Security
    - Everyone can view accessories
    - Only admins can manage (create/update/delete) accessories
*/

-- Ensure admin check function exists
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

-- Drop existing policies
DROP POLICY IF EXISTS "Accessories are viewable by everyone" ON accessories;
DROP POLICY IF EXISTS "Admins can insert accessories" ON accessories;
DROP POLICY IF EXISTS "Admins can update accessories" ON accessories;
DROP POLICY IF EXISTS "Admins can delete accessories" ON accessories;

-- Allow public viewing
CREATE POLICY "Accessories are viewable by everyone"
  ON accessories FOR SELECT
  USING (true);

-- Allow admins to insert accessories
CREATE POLICY "Admins can insert accessories"
  ON accessories FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Allow admins to update accessories
CREATE POLICY "Admins can update accessories"
  ON accessories FOR UPDATE
  USING (is_admin(auth.uid()));

-- Allow admins to delete accessories
CREATE POLICY "Admins can delete accessories"
  ON accessories FOR DELETE
  USING (is_admin(auth.uid()));