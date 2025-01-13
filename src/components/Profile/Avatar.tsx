import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  url: string | null;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

export function Avatar({ url, size = 'md', alt = 'Avatar' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  if (!url) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
        <User className={`${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} text-gray-400`} />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  );
}