-- Drop existing typing status table and related objects
DROP TABLE IF EXISTS typing_status CASCADE;
DROP FUNCTION IF EXISTS update_typing_status_timestamp CASCADE;
DROP FUNCTION IF EXISTS cleanup_typing_status CASCADE;

-- Create typing status table
CREATE TABLE typing_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  chat_with uuid REFERENCES profiles(id) NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
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