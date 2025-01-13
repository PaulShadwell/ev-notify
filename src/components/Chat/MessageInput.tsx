import React, { useState, useCallback, useEffect } from 'react';
import { Send } from 'lucide-react';
import { updateTypingStatus } from '../../lib/database/chat';
import { debounce } from '../../utils/debounce';

interface MessageInputProps {
  onSend: (message: string) => void;
  currentUserId: string;
  receiverId: string;
  disabled?: boolean;
}

export function MessageInput({ onSend, currentUserId, receiverId, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const debouncedTypingUpdate = useCallback(
    debounce((isTyping: boolean) => {
      updateTypingStatus(currentUserId, receiverId, isTyping);
    }, 500),
    [currentUserId, receiverId]
  );

  useEffect(() => {
    return () => {
      debouncedTypingUpdate.cancel();
      updateTypingStatus(currentUserId, receiverId, false);
    };
  }, [currentUserId, receiverId, debouncedTypingUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    try {
      await onSend(message.trim());
      setMessage('');
      debouncedTypingUpdate.cancel();
      updateTypingStatus(currentUserId, receiverId, false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    debouncedTypingUpdate(newMessage.length > 0);
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 sm:p-4 bg-white border-t">
      <div className="flex space-x-2 max-w-4xl mx-auto">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          disabled={disabled}
        />
        <button
          type="submit"
          className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          disabled={disabled || !message.trim()}
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </form>
  );
}