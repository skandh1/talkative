import React from 'react';

interface ChatBadgeProps {
  count: number;
  className?: string;
}

export const ChatBadge: React.FC<ChatBadgeProps> = ({ count, className = '' }) => {
  if (count === 0) return null;

  return (
    <div className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-medium text-white bg-red-500 rounded-full ${className}`}>
      {count > 99 ? '99+' : count}
    </div>
  );
};