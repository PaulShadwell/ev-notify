import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from '../../utils/date';
import { OnlineIndicator } from './OnlineIndicator';

interface Profile {
  id: string;
  plate_number: string;
  vehicle_model: string;
}

interface RecentChat {
  profile: Profile;
  lastMessage: string;
  lastMessageTime: string;
}

interface RecentChatsProps {
  currentUserId: string;
  onSelectChat: (user: Profile) => void;
  selectedUserId?: string;
  isOnline: (userId: string) => boolean;
}

export function RecentChats({ currentUserId, onSelectChat, selectedUserId, isOnline }: RecentChatsProps) {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  useEffect(() => {
    const fetchRecentChats = async () => {
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select(`
          sender_id,
          receiver_id,
          message,
          created_at,
          sender:profiles!chat_messages_sender_id_fkey(
            id,
            plate_number,
            vehicle_model
          ),
          receiver:profiles!chat_messages_receiver_id_fkey(
            id,
            plate_number,
            vehicle_model
          )
        `)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (chatData) {
        const uniqueChats = new Map<string, RecentChat>();
        
        chatData.forEach((chat) => {
          const otherUser = chat.sender_id === currentUserId ? chat.receiver : chat.sender;
          const otherUserId = otherUser.id;
          
          if (!uniqueChats.has(otherUserId)) {
            uniqueChats.set(otherUserId, {
              profile: {
                id: otherUser.id,
                plate_number: otherUser.plate_number,
                vehicle_model: otherUser.vehicle_model
              },
              lastMessage: chat.message,
              lastMessageTime: chat.created_at
            });
          }
        });

        setRecentChats(Array.from(uniqueChats.values()));
      }
    };

    fetchRecentChats();

    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=eq.${currentUserId} OR receiver_id=eq.${currentUserId}`
        },
        () => {
          fetchRecentChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId]);

  return (
    <div className="divide-y">
      {recentChats.map((chat) => (
        <button
          key={chat.profile.id}
          onClick={() => onSelectChat(chat.profile)}
          className={`w-full px-4 py-3 flex items-start hover:bg-gray-50 transition-colors ${
            selectedUserId === chat.profile.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <div className="font-medium">{chat.profile.plate_number}</div>
              <OnlineIndicator 
                isOnline={isOnline(chat.profile.id)} 
                className="scale-75 origin-right"
              />
            </div>
            <div className="text-sm text-gray-500">{chat.profile.vehicle_model}</div>
            <div className="text-sm text-gray-600 truncate">{chat.lastMessage}</div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDistanceToNow(new Date(chat.lastMessageTime))}
            </div>
          </div>
        </button>
      ))}
      {recentChats.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No recent chats
        </div>
      )}
    </div>
  );
}