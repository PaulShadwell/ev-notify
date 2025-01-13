import React from 'react';
import { ChatMessage } from '../../lib/database/chat/types';
import { Message } from './Message';
import { useProfiles } from '../../hooks/useProfiles';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isOtherUserTyping: boolean;
  selectedUser: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onEditMessage: (messageId: string, newText: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

export function MessageList({ 
  messages, 
  currentUserId, 
  isOtherUserTyping,
  selectedUser,
  messagesEndRef,
  onEditMessage,
  onDeleteMessage
}: MessageListProps) {
  const { profiles } = useProfiles([
    ...new Set(messages.map(msg => msg.sender_id))
  ]);

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isSender={message.sender_id === currentUserId}
          senderAvatar={profiles[message.sender_id]?.avatar_url}
          onEdit={onEditMessage}
          onDelete={onDeleteMessage}
        />
      ))}
      
      {isOtherUserTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg px-3 py-2 text-gray-500 text-sm">
            {selectedUser.plate_number} is typing...
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}