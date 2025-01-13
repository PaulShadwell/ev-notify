import React from 'react';

interface OnlineIndicatorProps {
  isOnline: boolean;
  className?: string;
}

export function OnlineIndicator({ isOnline, className = '' }: OnlineIndicatorProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-300'
        } mr-1.5 sm:mr-2`}
      />
      <span className="text-xs sm:text-sm text-gray-500">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}