import React from 'react';

export const Avatar = ({ name = '', avatar = '', size = 28, className = '' }) => {
  const initials = name
    ? name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || 'User avatar'}
        className={`avatar ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`avatar ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
