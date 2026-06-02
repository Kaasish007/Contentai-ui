import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabase';

export default function DMsModal({ user, onClose }) {
  const { t } = useTheme();
  const [activeConvo, setActiveConvo] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [newConvoMode, setNewConvoMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvo) fetchMessages(activeConvo.partner_id);
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`dms-${activeConvo.partner_id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'dms'
      }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === user?.id && msg.receiver_id === activeConvo.partner_id) ||
          (msg.sender_id === activeConvo.partner_id && msg.receiver_id === user?.id)
        ) {
          setMessages(prev => [...prev, msg]);
          // Update last message in convo list
          setConversations(prev => prev.map(c =>
            c.partner_id === activeConvo.partner_id
              ? { ...c, lastMessage: msg.content, time: 'just now' }
              : c
          ));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeConvo]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dms')
        .select('*')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convMap = {};
      (data || []).forEach(msg => {
        const partnerId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
        const partnerEmail = msg.sender_id === user?.id ? msg.receiver_email : msg.sender_email;
        if (!convMap[partnerId]) {
          convMap[partnerId] = {
            partner_id: partnerId,
            partner_email: partnerEmail,
            partner_name: partnerEmail?.split('@')[0] || 'Unknown',
            lastMessage: msg.content,
            time: formatTime(msg.created_at),
          };
        }
      });
      setConversations(Object.values(convMap));
    } catch (err) {
      console.log('Fetch convos error:', err.message);
    }
    setLoading(false);
  };

  const fetchMessages = async (partnerId) => {
    try {
      const { data, error } = await supabase
        .from('dms')
        .select('*')
        .or(
          `and(sender_id.eq.${user?.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user?.id})`
        )
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.log('Fetch messages error:', err.message);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvo) return;
    setSending(true);
    try {
      const { error } = await supabase.from('dms').insert({
        sender_id: user?.id,
        receiver_id: activeConvo.partner_id,
        sender_email: user?.email,
        receiver_email: activeConvo.partner_email,
        content: newMessage.trim()
      });
      if (error) throw error;

      // Send notification to receiver
      await supabase.from('notifications').insert({
        user_id: activeConvo.partner_id,
        from_user_id: user?.id,
        type: 'comment',
        message: `${user?.email?.split('@')[0]} sent you a message`
      });

      setNewMessage('');

      // Add to convo list if not already there
      const exists = conversations.find(c => c.partner_id === activeConvo.partner_id);
      if (!exists) {
        setConversations(prev => [{
          partner_id: activeConvo.partner_id,
          partner_email: activeConvo.partner_email,
          partner_name: activeConvo.partner_name,
          lastMessage: newMessage.trim(),
          time: 'just now'
        }, ...prev]);
      }
    } catch (err) {
      console.log('Send error:', err.message);
    }
    setSending(false);
  };

const searchUser = async () => {
  if (!searchEmail.trim()) return;
  setSearching(true);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('email', searchEmail.trim())
      .single();

    if (data?.user_id) {
      setActiveConvo({
        partner_id: data.user_id,
        partner_email: searchEmail.trim(),
        partner_name: searchEmail.trim().split('@')[0]
      });
      setMessages([]);
      setNewConvoMode(false);
      setSearchEmail('');
    } else {
      alert('User not found. Make sure they have a ContentAI account.');
    }
  } catch (err) {
    alert('User not found. Make sure they have a ContentAI account.');
  }
  setSearching(false);
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

  const formatMsgTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: t.bgCard, borderRadius: '16px', width: '820px', height: '560px',
        border: `1px solid ${t.border}`, display: 'flex', overflow: 'hidden',
        boxShadow: t.shadowLg
      }} onClick={e => e.stopPropagation()}>

        {/* Left — Conversations */}
        <div style={{ width: '260px', borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '16px', borderBottom: `1px solid ${t.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: 0 }}>Messages</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setNewConvoMode(true)}
                style={{
                  background: t.accent, border: 'none',
                  borderRadius: '6px', width: '26px', height: '26px',
                  color: 'white', cursor: 'pointer', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>+</button>
              <button onClick={onClose} style={{
                background: t.bgTertiary, border: `1px solid ${t.border}`,
                borderRadius: '6px', width: '26px', height: '26px',
                color: t.textSecondary, cursor: 'pointer', fontSize: '13px'
              }}>×</button>
            </div>
          </div>

          {/* Search within conversations */}
          <div style={{ padding: '10px' }}>
            <input placeholder="Search conversations..." style={{
              width: '100%', padding: '7px 10px', background: t.bgSecondary,
              border: `1px solid ${t.border}`, borderRadius: '6px',
              color: t.textPrimary, fontSize: '12px', outline: 'none', boxSizing: 'border-box'
            }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', padding: '20px' }}>Loading...</p>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>💬</p>
                <p style={{ color: t.textMuted, fontSize: '12px' }}>No conversations yet</p>
                <p style={{ color: t.accent, fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}
                  onClick={() => setNewConvoMode(true)}>
                  + Start one
                </p>
              </div>
            ) : (
              conversations.map(convo => (
                <div key={convo.partner_id} onClick={() => { setActiveConvo(convo); setNewConvoMode(false); }} style={{
                  padding: '12px 14px', cursor: 'pointer',
                  background: activeConvo?.partner_id === convo.partner_id ? t.accentSubtle : 'transparent',
                  borderLeft: activeConvo?.partner_id === convo.partner_id ? `2px solid ${t.accent}` : '2px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'all 0.15s'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '14px'
                  }}>{convo.partner_name?.[0]?.toUpperCase() || '?'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ color: t.textPrimary, fontSize: '13px', fontWeight: 600, margin: 0 }}>{convo.partner_name}</p>
                      <span style={{ color: t.textMuted, fontSize: '10px' }}>{convo.time}</span>
                    </div>
                    <p style={{ color: t.textSecondary, fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {convo.lastMessage}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — Chat or New Convo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* New Conversation Search Panel */}
          {newConvoMode ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '16px' }}>
              <p style={{ fontSize: '36px', margin: 0 }}>✉️</p>
              <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '15px', margin: 0 }}>New Message</p>
              <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>Enter the email of a ContentAI user</p>
              <input
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUser()}
                placeholder="user@example.com"
                style={{
                  width: '100%', maxWidth: '320px', padding: '10px 14px',
                  background: t.bgSecondary, border: `1px solid ${t.border}`,
                  borderRadius: '8px', color: t.textPrimary, fontSize: '13px',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setNewConvoMode(false)}
                  style={{
                    padding: '8px 16px', background: t.bgSecondary,
                    border: `1px solid ${t.border}`, borderRadius: '8px',
                    color: t.textSecondary, fontSize: '13px', cursor: 'pointer'
                  }}>Cancel</button>
                <button
                  onClick={searchUser}
                  disabled={searching || !searchEmail.trim()}
                  style={{
                    padding: '8px 20px', background: t.accent,
                    border: 'none', borderRadius: '8px',
                    color: 'white', fontSize: '13px', fontWeight: 600,
                    cursor: searching ? 'not-allowed' : 'pointer',
                    opacity: searching ? 0.7 : 1
                  }}>{searching ? 'Searching...' : 'Start Chat'}</button>
              </div>
            </div>

          ) : activeConvo ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '14px 18px', borderBottom: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '13px'
                }}>{activeConvo.partner_name?.[0]?.toUpperCase()}</div>
                <div>
                  <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '13px', margin: 0 }}>{activeConvo.partner_name}</p>
                  <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>{activeConvo.partner_email}</p>
                </div>
                <button style={{
                  marginLeft: 'auto', padding: '5px 12px', background: t.bgSecondary,
                  border: `1px solid ${t.border}`, borderRadius: '6px',
                  color: t.textSecondary, fontSize: '11px', cursor: 'pointer'
                }}>⭐ Gift Star</button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 && (
                  <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                    No messages yet. Say hello! 👋
                  </p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_id === user?.id ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '65%', padding: '9px 13px',
                      borderRadius: msg.sender_id === user?.id ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: msg.sender_id === user?.id ? t.accent : t.bgSecondary,
                      border: `1px solid ${msg.sender_id === user?.id ? t.accent : t.border}`,
                      color: msg.sender_id === user?.id ? 'white' : t.textPrimary,
                      fontSize: '13px', lineHeight: '1.5'
                    }}>
                      <p style={{ margin: 0 }}>{msg.content}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '10px', color: msg.sender_id === user?.id ? 'rgba(255,255,255,0.6)' : t.textMuted, textAlign: 'right' }}>
                        {formatMsgTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '12px 16px', borderTop: `1px solid ${t.border}`,
                display: 'flex', gap: '8px'
              }}>
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: '9px 12px', background: t.bgSecondary,
                    border: `1px solid ${t.border}`, borderRadius: '8px',
                    color: t.textPrimary, fontSize: '13px', outline: 'none'
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  style={{
                    padding: '9px 16px',
                    background: sending || !newMessage.trim() ? `${t.accent}66` : t.accent,
                    border: 'none', borderRadius: '8px', color: 'white',
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}>➤</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '40px' }}>💬</p>
              <p style={{ color: t.textSecondary, fontSize: '14px' }}>Select a conversation to start chatting</p>
              <button
                onClick={() => setNewConvoMode(true)}
                style={{
                  padding: '8px 16px', background: t.accent, color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer'
                }}>+ New Message</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}