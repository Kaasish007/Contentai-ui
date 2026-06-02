import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabase';

const icons = { star_gift: '⭐', like: '❤️', comment: '💬', update: '🆕', follow: '👤' };

export default function NotificationsModal({ user, onClose, onUnreadChange }) {
  const { t } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [senderNames, setSenderNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        if (payload.new.from_user_id) fetchSenderName(payload.new.from_user_id);
        if (onUnreadChange) onUnreadChange(c => c + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchSenderName = async (userId) => {
    if (!userId || senderNames[userId]) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', userId)
        .single();

      if (data?.username) {
        setSenderNames(prev => ({ ...prev, [userId]: data.username }));
      } else {
        // fallback: get email from auth
        const { data: authData } = await supabase
          .from('profiles')
          .select('email')
          .eq('user_id', userId)
          .single();
        const name = authData?.email?.split('@')[0] || 'Someone';
        setSenderNames(prev => ({ ...prev, [userId]: name }));
      }
    } catch {
      setSenderNames(prev => ({ ...prev, [userId]: 'Someone' }));
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setNotifications(data || []);

      // Fetch sender names for all notifications
      const senderIds = [...new Set((data || []).map(n => n.from_user_id).filter(Boolean))];
      await Promise.all(senderIds.map(id => fetchSenderName(id)));

      const unread = (data || []).filter(n => !n.read).length;
      if (onUnreadChange) onUnreadChange(unread);
    } catch (err) {
      console.log('Fetch notifications error:', err.message);
    }
    setLoading(false);
  };

  const markAllRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      if (onUnreadChange) onUnreadChange(0);
    } catch (err) {
      console.log('Mark read error:', err.message);
    }
  };

  const markOneRead = async (id) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      if (onUnreadChange) onUnreadChange(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.log('Mark one read error:', err.message);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotifText = (notif) => {
    const sender = notif.from_user_id
      ? (senderNames[notif.from_user_id] || 'Someone')
      : 'Someone';
    switch (notif.type) {
      case 'follow': return `${sender} started following you`;
      case 'like': return `${sender} liked your post`;
      case 'comment': return `${sender} commented on your post`;
      case 'star_gift': return notif.message || `${sender} gifted you stars`;
      default: return notif.message || `${sender} sent you a notification`;
    }
  };

  return (
    <div style={{
      position: 'fixed', top: '56px', right: '16px', zIndex: 1001,
      width: '360px', background: t.bgCard,
      border: `1px solid ${t.border}`, borderRadius: '12px',
      boxShadow: t.shadowLg, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid ${t.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h3 style={{ color: t.textPrimary, fontSize: '14px', fontWeight: 600, margin: 0 }}>
          Notifications
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span onClick={markAllRead} style={{ color: t.accent, fontSize: '12px', cursor: 'pointer' }}>
            Mark all read
          </span>
          <button onClick={onClose} style={{
            background: t.bgTertiary, border: `1px solid ${t.border}`,
            borderRadius: '4px', width: '22px', height: '22px',
            color: t.textSecondary, cursor: 'pointer', fontSize: '12px'
          }}>×</button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {loading ? (
          <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', padding: '30px' }}>
            Loading...
          </p>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</p>
            <p style={{ color: t.textMuted, fontSize: '13px' }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => markOneRead(notif.id)}
              style={{
                padding: '12px 16px', borderBottom: `1px solid ${t.border}`,
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                background: notif.read ? 'transparent' : t.accentSubtle,
                cursor: 'pointer', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = t.bgHover}
              onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : t.accentSubtle}
            >
              {/* Sender Avatar */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '12px'
              }}>
                {notif.from_user_id
                  ? (senderNames[notif.from_user_id] || '?')[0].toUpperCase()
                  : (icons[notif.type] || '🔔')}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: t.textPrimary, fontSize: '13px', margin: '0 0 3px', lineHeight: '1.4' }}>
                  {getNotifText(notif)}
                </p>
                <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>
                  {formatTime(notif.created_at)}
                </p>
              </div>
              {!notif.read && (
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: t.accent, flexShrink: 0, marginTop: '4px'
                }} />
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '10px 16px', borderTop: `1px solid ${t.border}`, textAlign: 'center' }}>
        <span onClick={fetchNotifications} style={{ color: t.accent, fontSize: '13px', cursor: 'pointer' }}>
          Refresh
        </span>
      </div>
    </div>
  );
}