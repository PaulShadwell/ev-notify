import { useState, useEffect, useCallback } from 'react';
import { 
  ChatMessage, 
  fetchMessages, 
  sendMessage, 
  editMessage,
  deleteMessage,
  subscribeToMessages 
} from '../lib/database/chat/messages';
import type { ChatMessage as ChatMessageType } from '../lib/database/chat/types';

export function useChat(currentUserId: string, selectedUserId: string | null) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      const data = await fetchMessages(currentUserId, selectedUserId);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedUserId]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedUserId) return;

    try {
      await sendMessage(currentUserId, selectedUserId, message);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [currentUserId, selectedUserId]);

  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      await editMessage(messageId, newText, currentUserId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit message');
      throw err;
    }
  }, [currentUserId]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId, currentUserId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      throw err;
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }
    
    loadMessages();

    const subscription = subscribeToMessages(
      currentUserId,
      selectedUserId,
      (newMessage) => {
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      },
      (updatedMessage) => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      },
      (deletedMessageId) => {
        setMessages((prev) => 
          prev.filter((msg) => msg.id !== deletedMessageId)
        );
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId, selectedUserId, loadMessages]);

  return {
    messages,
    error,
    loading,
    sendMessage: handleSendMessage,
    editMessage: handleEditMessage,
    deleteMessage: handleDeleteMessage
  };
}