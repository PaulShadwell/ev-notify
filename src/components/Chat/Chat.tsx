import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { Search, ArrowLeft } from 'lucide-react';
import { UserSearch } from './UserSearch';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { RecentChats } from './RecentChats';
import { OnlineIndicator } from './OnlineIndicator';
import { useChat } from '../../hooks/useChat';
import { usePresence } from '../../hooks/usePresence';
import { subscribeToTypingStatus } from '../../lib/database/chat';

interface ChatProps {
  session: Session;
}

export function Chat({ session }: ChatProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    error, 
    sendMessage,
    editMessage,
    deleteMessage
  } = useChat(session.user.id, selectedUser?.id);

  const { isOnline } = usePresence(session.user.id);

  useEffect(() => {
    if (selectedUser) {
      const subscription = subscribeToTypingStatus(
        session.user.id,
        selectedUser.id,
        (isTyping) => setIsOtherUserTyping(isTyping)
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [session.user.id, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherUserTyping]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(!selectedUser);
      } else {
        setShowSidebar(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedUser]);

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setShowSearch(false);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setShowSidebar(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 bg-white border-r flex flex-col`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Chats</h2>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        {showSearch && (
          <div className="p-4 border-b">
            <UserSearch
              onUserSelect={handleUserSelect}
              currentUserId={session.user.id}
            />
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <RecentChats
            currentUserId={session.user.id}
            onSelectChat={handleUserSelect}
            selectedUserId={selectedUser?.id}
            isOnline={isOnline}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!showSidebar ? 'block' : 'hidden'} md:block flex-1 flex flex-col`}>
        {selectedUser ? (
          <>
            <div className="p-4 bg-white border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden mr-3 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="font-medium">{selectedUser.plate_number}</div>
                    <div className="text-sm text-gray-500">{selectedUser.vehicle_model}</div>
                  </div>
                </div>
                <OnlineIndicator isOnline={isOnline(selectedUser.id)} />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-b border-red-100 text-red-700">
                {error}
              </div>
            )}

            <MessageList
              messages={messages}
              currentUserId={session.user.id}
              isOtherUserTyping={isOtherUserTyping}
              selectedUser={selectedUser}
              messagesEndRef={messagesEndRef}
              onEditMessage={editMessage}
              onDeleteMessage={deleteMessage}
            />

            <MessageInput
              onSend={sendMessage}
              currentUserId={session.user.id}
              receiverId={selectedUser.id}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
            Select a chat or search for a user to start messaging
          </div>
        )}
      </div>
    </div>
  );
}