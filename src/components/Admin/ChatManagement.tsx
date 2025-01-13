import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface ChatManagementProps {
  session: Session;
}

export function ChatManagement({ session }: ChatManagementProps) {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    fetchChats();
  }, []);

  async function fetchChats() {
    const { data } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(plate_number),
        receiver:profiles!chat_messages_receiver_id_fkey(plate_number)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setChats(data);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Chat History</h2>
      <div className="bg-white shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chats.map((chat) => (
              <tr key={chat.id}>
                <td className="px-6 py-4 whitespace-nowrap">{chat.sender.plate_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{chat.receiver.plate_number}</td>
                <td className="px-6 py-4">{chat.message}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(chat.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}