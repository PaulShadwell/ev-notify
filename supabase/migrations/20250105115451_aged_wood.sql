/*
  # Add admin management policies for accessories

  1. Changes
    - Add policies to allow admins to manage accessories (insert, update, delete)
    - Keep existing policy for public viewing
    - Use is_admin() function for policy checks

  2. Security
    - Only admins can insert/update/delete accessories
    - Everyone can view accessories
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Accessories are viewable by everyone" ON accessories;
DROP POLICY IF EXISTS "Admins can manage accessories" ON accessories;

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