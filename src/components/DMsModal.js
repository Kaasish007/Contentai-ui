import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const conversations = [
  { id: '1', name: 'Rahul K', avatar: 'R', lastMessage: 'Hey, loved your post!', time: '2m ago', unread: 2 },
  { id: '2', name: 'Priya S', avatar: 'P', lastMessage: 'Can you share that template?', time: '1h ago', unread: 0 },
  { id: '3', name: 'Arun M', avatar: 'A', lastMessage: 'Thanks for the star! 🌟', time: '3h ago', unread: 1 },
];

const sampleMessages = {
  '1': [
    { id: 1, content: 'Hey, loved your post!', mine: false, time: '10:30 AM' },
    { id: 2, content: 'Thank you so much! 😊', mine: true, time: '10:31 AM' },
    { id: 3, content: 'How did you generate that LinkedIn content?', mine: false, time: '10:32 AM' },
  ],
  '2': [{ id: 1, content: 'Can you share that template?', mine: false, time: '9:00 AM' }],
  '3': [
    { id: 1, content: 'Thanks for the star! 🌟', mine: false, time: '7:00 AM' },
    { id: 2, content: 'You deserved it! Great content 🔥', mine: true, time: '7:05 AM' },
  ],
};

export default function DMsModal({ user, onClose }) {
  const { t } = useTheme();
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const selectConvo = (convo) => {
    setActiveConvo(convo);
    setMessages(sampleMessages[convo.id] || []);
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1, content: newMessage, mine: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage('');
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
            <button onClick={onClose} style={{
              background: t.bgTertiary, border: `1px solid ${t.border}`,
              borderRadius: '6px', width: '26px', height: '26px',
              color: t.textSecondary, cursor: 'pointer', fontSize: '13px'
            }}>×</button>
          </div>

          <div style={{ padding: '10px' }}>
            <input placeholder="Search..." style={{
              width: '100%', padding: '7px 10px', background: t.bgSecondary,
              border: `1px solid ${t.border}`, borderRadius: '6px',
              color: t.textPrimary, fontSize: '12px', outline: 'none', boxSizing: 'border-box'
            }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map(convo => (
              <div key={convo.id} onClick={() => selectConvo(convo)} style={{
                padding: '12px 14px', cursor: 'pointer',
                background: activeConvo?.id === convo.id ? t.accentSubtle : 'transparent',
                borderLeft: activeConvo?.id === convo.id ? `2px solid ${t.accent}` : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'all 0.15s'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '14px'
                }}>{convo.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ color: t.textPrimary, fontSize: '13px', fontWeight: 600, margin: 0 }}>{convo.name}</p>
                    <span style={{ color: t.textMuted, fontSize: '10px' }}>{convo.time}</span>
                  </div>
                  <p style={{ color: t.textSecondary, fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {convo.lastMessage}
                  </p>
                </div>
                {convo.unread > 0 && (
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: t.accent, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontSize: '9px', fontWeight: 700
                  }}>{convo.unread}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeConvo ? (
            <>
              <div style={{
                padding: '14px 18px', borderBottom: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '13px'
                }}>{activeConvo.avatar}</div>
                <div>
                  <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '13px', margin: 0 }}>{activeConvo.name}</p>
                  <p style={{ color: t.success, fontSize: '11px', margin: 0 }}>● Online</p>
                </div>
                <button style={{
                  marginLeft: 'auto', padding: '5px 12px', background: t.bgSecondary,
                  border: `1px solid ${t.border}`, borderRadius: '6px',
                  color: t.textSecondary, fontSize: '11px', cursor: 'pointer'
                }}>⭐ Gift Star</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '65%', padding: '9px 13px',
                      borderRadius: msg.mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: msg.mine ? t.accent : t.bgSecondary,
                      border: `1px solid ${msg.mine ? t.accent : t.border}`,
                      color: msg.mine ? 'white' : t.textPrimary,
                      fontSize: '13px', lineHeight: '1.5'
                    }}>
                      <p style={{ margin: 0 }}>{msg.content}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '10px', color: msg.mine ? 'rgba(255,255,255,0.6)' : t.textMuted, textAlign: 'right' }}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

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
                <button onClick={handleSend} style={{
                  padding: '9px 16px', background: t.accent,
                  border: 'none', borderRadius: '8px', color: 'white',
                  cursor: 'pointer', fontSize: '14px'
                }}>➤</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '40px' }}>💬</p>
              <p style={{ color: t.textSecondary, fontSize: '14px' }}>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}