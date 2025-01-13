import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, X, Check } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/date';
import { Avatar } from '../Profile/Avatar';
import type { ChatMessage } from '../../lib/database/chat/types';

interface MessageProps {
  message: ChatMessage;
  isSender: boolean;
  senderAvatar: string | null;
  onEdit: (messageId: string, newText: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
}

export function Message({ message, isSender, senderAvatar, onEdit, onDelete }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [editedText, setEditedText] = useState(message.message);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    if (editedText.trim() === message.message) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);
      await onEdit(message.id, editedText.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      setIsLoading(true);
      await onDelete(message.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`group flex items-start gap-2 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar url={senderAvatar} size="sm" />
      
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] rounded-lg px-3 py-2 sm:px-4 ${
          isSender ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isSender && !isEditing && (
          <div className="absolute right-0 top-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={isLoading}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  disabled={isLoading}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-2 text-sm text-gray-900 bg-white rounded border focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isLoading}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(message.message);
                }}
                className="p-1 hover:bg-gray-200 rounded"
                disabled={isLoading}
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleEdit}
                className="p-1 hover:bg-gray-200 rounded"
                disabled={isLoading}
              >
                <Check className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm sm:text-base break-words">{message.message}</p>
            <p className={`text-xs mt-1 ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatDistanceToNow(new Date(message.created_at))}
            </p>
          </>
        )}
      </div>
    </div>
  );
}