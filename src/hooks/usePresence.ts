import { useState, useEffect } from 'react';
import { setupPresence } from '../lib/database/presence';

export function usePresence(userId: string | undefined) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const presence = setupPresence(userId);
    const interval = setInterval(() => {
      const state = presence.getOnlineUsers();
      const online = new Set(Object.keys(state));
      setOnlineUsers(online);
    }, 1000);

    return () => {
      clearInterval(interval);
      presence.unsubscribe();
    };
  }, [userId]);

  return {
    isOnline: (id: string) => onlineUsers.has(id),
    onlineUsers,
  };
}