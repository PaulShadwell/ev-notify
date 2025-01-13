import { supabase } from '../../supabase';
import { ChatMessage } from './types';

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

export async function editMessage(messageId: string, newMessage: string, userId: string) {
  const { error } = await supabase
    .from('chat_messages')
    .update({ message: newMessage })
    .eq('id', messageId)
    .eq('sender_id', userId);

  if (error) {
    throw new Error(`Failed to edit message: ${error.message}`);
  }
}

export async function deleteMessage(messageId: string, userId: string) {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', userId);

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }
}

export async function fetchMessages(userId: string, otherUserId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data || [];
}

export function subscribeToMessages(
  userId: string, 
  otherUserId: string, 
  onMessage: (message: ChatMessage) => void,
  onUpdate: (message: ChatMessage) => void,
  onDelete: (messageId: string) => void
) {
  // Create a unique channel name for this chat
  const channelName = `chat:${[userId, otherUserId].sort().join(':')}`;
  
  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `sender_id=in.(${userId},${otherUserId})`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const message = payload.new as ChatMessage;
          if (
            (message.sender_id === userId && message.receiver_id === otherUserId) ||
            (message.sender_id === otherUserId && message.receiver_id === userId)
          ) {
            onMessage(message);
          }
        } else if (payload.eventType === 'UPDATE') {
          onUpdate(payload.new as ChatMessage);
        } else if (payload.eventType === 'DELETE') {
          onDelete(payload.old.id);
        }
      }
    );

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to chat messages:', channelName);
    } else if (status === 'CLOSED') {
      console.log('Channel closed:', channelName);
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Channel error:', channelName);
    }
  });

  return {
    unsubscribe: () => {
      console.log('Unsubscribing from chat messages:', channelName);
      channel.unsubscribe();
    }
  };
}