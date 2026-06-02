import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFollow } from '../hooks/useFollow';

export default function FollowButton({ currentUserId, targetUserId, size = 'md' }) {
  const { t } = useTheme();
  const { following, loading, toggle } = useFollow(currentUserId, targetUserId);
  const [hovered, setHovered] = useState(false);

  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return null;

  const sizes = {
    sm: { padding: '3px 10px', fontSize: '11px' },
    md: { padding: '5px 14px', fontSize: '13px' },
    lg: { padding: '7px 20px', fontSize: '14px' }
  };

  const getLabel = () => {
    if (loading) return '...';
    if (following && hovered) return 'Unfollow';
    if (following) return 'Following';
    return 'Follow';
  };

  const getStyle = () => ({
    ...sizes[size],
    borderRadius: '20px',
    border: following
      ? `1px solid ${hovered ? '#ef4444' : t.border}`
      : `1px solid ${t.accent}`,
    background: following ? 'transparent' : t.accent,
    color: following
      ? (hovered ? '#ef4444' : t.textSecondary)
      : '#ffffff',
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    lineHeight: 1,
  });

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      disabled={loading}
      style={getStyle()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {getLabel()}
    </button>
  );
}