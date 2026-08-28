import React from 'react';

export const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return src ? (
    <img
      src={src}
      alt={name || 'Avatar'}
      className={`${sizes[size]} rounded-full object-cover border border-primary/30 ${className}`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-md ${className}`}
    >
      {initials}
    </div>
  );
};
