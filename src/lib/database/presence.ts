import { supabase } from '../supabase';
import { RealtimePresenceState } from '@supabase/supabase-js';

const PRESENCE_CHANNEL = 'online_users';

export function setupPresence(userId: string) {
  const channel = supabase.channel(PRESENCE_CHANNEL, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      console.log('Presence synced:', channel.presenceState());
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

  return {
    getOnlineUsers: () => channel.presenceState() as RealtimePresenceState,
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}