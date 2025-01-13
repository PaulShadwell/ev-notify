export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export interface TypingStatus {
  user_id: string;
  chat_with: string;
  is_typing: boolean;
}