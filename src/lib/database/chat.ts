import { supabase } from '../supabase';

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

export async function sendMessage(senderId: string, receiverId: string, message: string) {
  const { error } = await supabase
    .from('chat_messages')
    .insert([{
      sender_id: senderId,
      receiver_id: receiverId,
      message
    }]);

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

export async function fetchMessages(userId: string, otherUserId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data || [];
}

export function subscribeToMessages(
  userId: string, 
  otherUserId: string, 
  onMessage: (message: ChatMessage) => void
) {
  const channel = supabase.channel('public:chat_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `(sender_id=eq.${userId} AND receiver_id=eq.${otherUserId}) OR (sender_id=eq.${otherUserId} AND receiver_id=eq.${userId})`
      },
      (payload) => {
        onMessage(payload.new as ChatMessage);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    }
  };
}

export async function updateTypingStatus(userId: string, chatWith: string, isTyping: boolean) {
  try {
    // Delete any existing status first
    await supabase
      .from('typing_status')
      .delete()
      .eq('user_id', userId)
      .eq('chat_with', chatWith);

    // Insert new status if typing
    if (isTyping) {
      const { error } = await supabase
        .from('typing_status')
        .insert({
          user_id: userId,
          chat_with: chatWith,
          is_typing: true
        });

      if (error) {
        console.error('Error updating typing status:', error);
      }
    }
  } catch (error) {
    console.error('Error updating typing status:', error);
  }
}

export function subscribeToTypingStatus(
  userId: string,
  otherUserId: string,
  onTypingChange: (isTyping: boolean) => void
) {
  const channel = supabase.channel('public:typing_status')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `user_id=eq.${otherUserId} AND chat_with=eq.${userId}`
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onTypingChange(false);
        } else {
          const status = payload.new as TypingStatus;
          onTypingChange(status.is_typing);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    }
  };
}