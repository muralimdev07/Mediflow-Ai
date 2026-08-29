import React, { useState, useEffect } from 'react';

export const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'User Avatar'}
        onError={() => setImageError(true)}
        className={`${sizes[size] || sizes.md} rounded-full object-cover border border-primary/30 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size] || sizes.md} rounded-full bg-gradient-to-br from-primary via-teal-600 to-secondary flex items-center justify-center font-bold text-white shadow-md border border-primary/30 shrink-0 select-none ${className}`}
      title={name || 'User'}
    >
      {initials}
    </div>
  );
};

