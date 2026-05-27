import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { supabase } from '../utils/supabase';

const rewards = [
  { id: 1, name: '1 Week Creator Plan', icon: '🎁', cost: 50, desc: 'Unlock Creator features for 7 days' },
  { id: 2, name: 'Creator Spotlight', icon: '🔦', cost: 30, desc: 'Pinned to top of Canvas for 24 hours' },
  { id: 3, name: 'AI Power Mode', icon: '⚡', cost: 20, desc: 'Bigger limits and faster generation for 3 days' },
  { id: 4, name: 'Verified Creator Badge', icon: '✅', cost: 100, desc: 'Special checkmark on your profile forever' },
  { id: 5, name: 'Exclusive Canvas Theme', icon: '🎨', cost: 25, desc: 'Unlock a unique theme for your profile' },
];

export default function StarsModal({ user, onClose }) {
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadStars();
  }, []);

  const loadStars = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const [balRes, histRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/stars/balance`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/stars/history`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBalance(balRes.data.balance);
      setHistory(histRes.data.history);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = ['Overview', 'History', 'Redeem'];

  const reasonLabels = {
    daily_login: '📅 Daily Login',
    post_published: '📝 Post Published',
    likes_milestone: '❤️ Likes Milestone',
    gifted: '🎁 Gift Received',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: t.bgCard, borderRadius: '16px', width: '640px',
        maxHeight: '85vh', overflow: 'hidden', border: `1px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', boxShadow: t.shadowLg
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${t.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ color: t.textPrimary, fontSize: '18px', fontWeight: 700, margin: '0 0 2px' }}>⭐ Stars</h2>
            <p style={{ color: t.textSecondary, fontSize: '13px', margin: 0 }}>Earn stars, redeem rewards</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: t.bgSecondary, border: `1px solid ${t.star}44`,
              borderRadius: '10px', padding: '10px 16px', textAlign: 'center'
            }}>
              <p style={{ color: t.star, fontSize: '24px', fontWeight: 700, margin: 0 }}>{balance}</p>
              <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>Total Stars</p>
            </div>
            <button onClick={onClose} style={{
              background: t.bgTertiary, border: `1px solid ${t.border}`,
              borderRadius: '6px', width: '28px', height: '28px',
              color: t.textSecondary, cursor: 'pointer', fontSize: '14px'
            }}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, padding: '0 24px' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 16px', border: 'none', background: 'transparent',
              color: activeTab === tab ? t.accent : t.textSecondary,
              fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === tab ? `2px solid ${t.accent}` : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.15s'
            }}>{tab}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {activeTab === 'Overview' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>How to Earn Stars</h3>
              {[
                { icon: '📅', action: 'Daily Login', stars: '+1 star', desc: 'Log in every day' },
                { icon: '📝', action: 'Publish Content', stars: '+2 stars', desc: 'Publish to The Canvas' },
                { icon: '❤️', action: 'Get 10 Likes', stars: '+5 stars', desc: 'When your post reaches 10 likes' },
                { icon: '❤️', action: 'Get 50 Likes', stars: '+15 stars', desc: 'When your post reaches 50 likes' },
                { icon: '🎁', action: 'Receive Star Gift', stars: 'Varies', desc: 'When another user gifts you stars' },
              ].map(item => (
                <div key={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', borderRadius: '8px', marginBottom: '8px',
                  background: t.bgSecondary, border: `1px solid ${t.border}`
                }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '13px', margin: '0 0 2px' }}>{item.action}</p>
                    <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{item.desc}</p>
                  </div>
                  <span style={{
                    color: t.star, fontWeight: 700, fontSize: '12px',
                    background: `${t.star}22`, padding: '3px 10px', borderRadius: '20px'
                  }}>{item.stars}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'History' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>Star History</h3>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', border: `1px dashed ${t.border}`, borderRadius: '8px' }}>
                  <p style={{ color: t.textMuted, fontSize: '14px' }}>No history yet — start earning! ⭐</p>
                </div>
              ) : history.map(item => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '8px', marginBottom: '6px',
                  background: t.bgSecondary, border: `1px solid ${t.border}`
                }}>
                  <div>
                    <p style={{ color: t.textPrimary, fontSize: '13px', margin: '0 0 2px' }}>
                      {reasonLabels[item.reason] || item.reason}
                    </p>
                    <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    color: item.type === 'earned' ? t.success : t.danger,
                    fontWeight: 700, fontSize: '14px'
                  }}>
                    {item.type === 'earned' ? '+' : '-'}{item.amount} ⭐
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Redeem' && (
            <div>
              <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
                You have <strong style={{ color: t.star }}>{balance} stars</strong> to spend
              </p>
              {rewards.map(reward => (
                <div key={reward.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px', borderRadius: '8px', marginBottom: '8px',
                  background: t.bgSecondary, border: `1px solid ${t.border}`,
                  opacity: balance >= reward.cost ? 1 : 0.5
                }}>
                  <span style={{ fontSize: '24px' }}>{reward.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '13px', margin: '0 0 2px' }}>{reward.name}</p>
                    <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{reward.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: t.star, fontWeight: 700, fontSize: '13px', margin: '0 0 6px' }}>{reward.cost} ⭐</p>
                    <button
                      disabled={balance < reward.cost}
                      style={{
                        padding: '5px 14px',
                        background: balance >= reward.cost ? t.accent : t.bgTertiary,
                        color: balance >= reward.cost ? 'white' : t.textMuted,
                        border: 'none', borderRadius: '6px',
                        fontSize: '12px', cursor: balance >= reward.cost ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}