/*
  # Add connector types table

  1. New Tables
    - `connector_types`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `connector_types` table
    - Add policy for public read access
*/

-- Create connector types table
CREATE TABLE connector_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE connector_types ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Connector types are viewable by everyone"
  ON connector_types FOR SELECT
  USING (true);

-- Insert common connector types
INSERT INTO connector_types (name) VALUES
  ('Type 1 (J1772)'),
  ('Type 2 (Mennekes)'),
  ('CHAdeMO'),
  ('CCS (Type 1)'),
  ('CCS (Type 2)'),
  ('Tesla Supercharger'),
  ('Tesla Destination'),
  ('Wall Plug (3-pin)');