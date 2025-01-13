import { supabase } from '../../supabase';
import { TypingStatus } from './types';

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
  // Create a unique channel name for typing status
  const channelName = `typing:${[userId, otherUserId].sort().join(':')}`;

  const channel = supabase.channel(channelName)
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
    );

  // Start the subscription
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Connected to typing status channel:', channelName);
    }
  });

  return {
    unsubscribe: () => {
      console.log('Unsubscribing from typing status channel:', channelName);
      channel.unsubscribe();
    }
  };
}