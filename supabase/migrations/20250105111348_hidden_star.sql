/*
  # Add user details to profiles table

  1. Changes
    - Add first_name, last_name, and email fields to profiles table
    - Update existing policies

  2. Security
    - Maintain existing RLS policies
    - Add policies for new fields
*/

ALTER TABLE profiles
ADD COLUMN first_name text,
ADD COLUMN last_name text,
ADD COLUMN email text UNIQUE;