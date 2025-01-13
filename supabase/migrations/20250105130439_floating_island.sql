/*
  # Enable real-time for chat features
  
  1. Changes
    - Enable real-time for chat_messages and typing_status tables
    - Refresh RLS policies to ensure proper access control
  
  2. Security
    - Maintain existing RLS policies
    - Ensure proper user access to messages and typing status
*/

-- Enable real-time for tables that aren't already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'typing_status'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE typing_status;
  END IF;
END $$;