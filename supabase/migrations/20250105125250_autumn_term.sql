/*
  # Enable real-time for chat tables

  1. Changes
    - Enable RLS for chat_messages and typing_status tables
    - Add RLS policies for chat_messages
    - Add RLS policies for typing_status
*/

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Refresh chat_messages policies
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
CREATE POLICY "Users can insert their own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Refresh typing_status policies
DROP POLICY IF EXISTS "Users can manage their own typing status" ON typing_status;
CREATE POLICY "Users can manage their own typing status"
  ON typing_status FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view typing status in their chats" ON typing_status;
CREATE POLICY "Users can view typing status in their chats"
  ON typing_status FOR SELECT
  USING (auth.uid() IN (user_id, chat_with));