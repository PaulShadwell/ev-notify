/*
  # Fix typing status table and policies

  1. Changes
    - Drop and recreate typing_status table with proper constraints
    - Add better policies for real-time updates
    - Add trigger to clean up old typing status records

  2. Security
    - Enable RLS
    - Add policies for insert/update/select
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS typing_status CASCADE;

-- Recreate typing status table
CREATE TABLE typing_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  chat_with uuid REFERENCES profiles(id) NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT typing_status_user_pair_key UNIQUE(user_id, chat_with),
  CONSTRAINT typing_status_different_users CHECK (user_id != chat_with)
);

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own typing status"
  ON typing_status
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view typing status in their chats"
  ON typing_status
  FOR SELECT
  USING (auth.uid() IN (user_id, chat_with));

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_typing_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_typing_status_timestamp
  BEFORE UPDATE ON typing_status
  FOR EACH ROW
  EXECUTE FUNCTION update_typing_status_timestamp();

-- Create function to clean up old typing status
CREATE OR REPLACE FUNCTION cleanup_typing_status()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM typing_status
  WHERE updated_at < now() - INTERVAL '10 seconds';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cleanup
CREATE TRIGGER cleanup_typing_status
  AFTER INSERT OR UPDATE ON typing_status
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_typing_status();