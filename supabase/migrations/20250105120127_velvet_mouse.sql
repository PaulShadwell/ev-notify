/*
  # Add typing status support

  1. New Tables
    - `typing_status`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `chat_with` (uuid, references profiles)
      - `is_typing` (boolean)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for reading and updating typing status
*/

-- Create typing status table
CREATE TABLE IF NOT EXISTS typing_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  chat_with uuid REFERENCES profiles(id) NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, chat_with)
);

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create single policy for insert/update
CREATE POLICY "Users can manage their own typing status"
  ON typing_status
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create separate policy for viewing
CREATE POLICY "Users can view typing status in their chats"
  ON typing_status FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = chat_with
  );