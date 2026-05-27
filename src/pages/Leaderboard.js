import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const leagueData = {
  diamond: [
    { rank: 1, name: 'Arjun S', stars: 2840, badge: '🌟', change: '+12' },
    { rank: 2, name: 'Priya M', stars: 2650, badge: '🌟', change: '+8' },
    { rank: 3, name: 'Rahul K', stars: 2410, badge: '🌟', change: '+15' },
  ],
  gold: [
    { rank: 4, name: 'Sneha R', stars: 1890, badge: '⭐', change: '+5' },
    { rank: 5, name: 'Vikram P', stars: 1750, badge: '⭐', change: '+20' },
    { rank: 6, name: 'Anita B', stars: 1620, badge: '⭐', change: '-3' },
  ],
  silver: [
    { rank: 7, name: 'Karan J', stars: 980, badge: '✦', change: '+7' },
    { rank: 8, name: 'Meera T', stars: 890, badge: '✦', change: '+2' },
  ],
  bronze: [
    { rank: 9, name: 'Ravi N', stars: 450, badge: '◆', change: '+1' },
    { rank: 10, name: 'Kavya L', stars: 380, badge: '◆', change: '+4' },
  ]
};

const categoryKings = [
  { platform: 'LinkedIn', icon: 'in', color: '#0a66c2', king: 'Arjun S', posts: 142 },
  { platform: 'Twitter', icon: '𝕏', color: '#1d9bf0', king: 'Priya M', posts: 289 },
  { platform: 'Instagram', icon: '◎', color: '#e1306c', king: 'Rahul K', posts: 98 },
  { platform: 'YouTube', icon: '▶', color: '#ff0000', king: 'Sneha R', posts: 34 },
  { platform: 'Blog', icon: '✍', color: '#22c55e', king: 'Vikram P', posts: 67 },
];

const risingStars = [
  { name: 'Kavya L', growth: '+380%', stars: 380, avatar: 'K' },
  { name: 'Ravi N', growth: '+290%', stars: 450, avatar: 'R' },
  { name: 'Karan J', growth: '+180%', stars: 980, avatar: 'K' },
];

const wallOfFame = [
  { title: 'AI is transforming healthcare...', user: 'Arjun S', likes: 1240, platform: 'LinkedIn' },
  { title: 'Thread: 10 lessons from building...', user: 'Priya M', likes: 980, platform: 'Twitter' },
  { title: 'The future of content creation...', user: 'Rahul K', likes: 876, platform: 'Blog' },
];

export default function Leaderboard({ user }) {
  const { t } = useTheme();
  const [activeView, setActiveView] = useState('galaxy');

  const views = [
    { id: 'galaxy', label: '🌌 Creator Leagues' },
    { id: 'rising', label: '📈 Rising Stars' },
    { id: 'category', label: '🏆 Category Kings' },
    { id: 'fame', label: '🎖️ Wall of Fame' },
  ];

  const leagueConfig = {
    diamond: { label: 'Diamond', color: '#60a5fa', bg: '#60a5fa15', size: 56, stars: '2000+' },
    gold: { label: 'Gold', color: '#fbbf24', bg: '#fbbf2415', size: 48, stars: '1000+' },
    silver: { label: 'Silver', color: '#94a3b8', bg: '#94a3b815', size: 40, stars: '500+' },
    bronze: { label: 'Bronze', color: '#f97316', bg: '#f9731615', size: 36, stars: '100+' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
          Leaderboard
        </h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
          Top creators ranked by stars and contributions
        </p>
      </div>

      {/* View Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '24px',
        borderBottom: `1px solid ${t.border}`, paddingBottom: '0'
      }}>
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            style={{
              padding: '10px 16px', border: 'none', background: 'transparent',
              color: activeView === view.id ? t.accent : t.textSecondary,
              fontSize: '13px', fontWeight: activeView === view.id ? 600 : 400,
              cursor: 'pointer', borderBottom: activeView === view.id ? `2px solid ${t.accent}` : '2px solid transparent',
              transition: 'all 0.15s', marginBottom: '-1px'
            }}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Creator Leagues — Star Galaxy */}
      {activeView === 'galaxy' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {Object.entries(leagueData).map(([league, players]) => {
              const config = leagueConfig[league];
              return (
                <div key={league} style={{
                  background: t.bgCard, border: `1px solid ${config.color}44`,
                  borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                      width: `${config.size}px`, height: `${config.size}px`,
                      borderRadius: '50%', background: config.bg,
                      border: `2px solid ${config.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: config.size * 0.4 + 'px'
                    }}>
                      ✦
                    </div>
                    <div>
                      <p style={{ color: config.color, fontWeight: 700, fontSize: '16px', margin: 0 }}>
                        {config.label} League
                      </p>
                      <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>
                        {config.stars} stars required
                      </p>
                    </div>
                  </div>

                  {players.map(player => (
                    <div key={player.rank} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 0', borderBottom: `1px solid ${t.border}`
                    }}>
                      <span style={{ color: t.textMuted, fontSize: '12px', width: '20px' }}>#{player.rank}</span>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: config.bg, border: `1px solid ${config.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: config.color, fontWeight: 700, fontSize: '11px'
                      }}>
                        {player.name[0]}
                      </div>
                      <span style={{ color: t.textPrimary, fontSize: '13px', flex: 1 }}>{player.name}</span>
                      <span style={{ color: t.star, fontSize: '12px', fontWeight: 600 }}>⭐ {player.stars}</span>
                      <span style={{
                        color: player.change.startsWith('+') ? t.success : t.danger,
                        fontSize: '11px', fontWeight: 600
                      }}>
                        {player.change}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Your Position */}
          <div style={{
            marginTop: '16px', padding: '16px 20px',
            background: t.bgCard, border: `1px solid ${t.accent}44`,
            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: t.accentSubtle, border: `2px solid ${t.accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.accent, fontWeight: 700, fontSize: '14px'
            }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>
                Your Position
              </p>
              <p style={{ color: t.textSecondary, fontSize: '12px', margin: 0 }}>
                Keep earning stars to climb the leagues!
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: t.star, fontWeight: 700, fontSize: '16px', margin: '0 0 2px' }}>🌱 Newcomer</p>
              <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>Earn 100 stars for Bronze</p>
            </div>
          </div>
        </div>
      )}

      {/* Rising Stars */}
      {activeView === 'rising' && (
        <div>
          <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
            Creators who grew the most this week 🚀
          </p>
          {risingStars.map((star, i) => (
            <div key={star.name} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '12px', padding: '16px 20px', marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: t.shadowCard
            }}>
              <span style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: ['#fbbf2422', '#94a3b822', '#f9731622'][i],
                border: `2px solid ${['#fbbf24', '#94a3b8', '#f97316'][i]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: ['#fbbf24', '#94a3b8', '#f97316'][i],
                fontWeight: 700, fontSize: '12px'
              }}>
                {i + 1}
              </span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: t.accentSubtle, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: t.accent, fontWeight: 700, fontSize: '14px'
              }}>
                {star.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{star.name}</p>
                <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{star.stars} total stars</p>
              </div>
              <span style={{
                color: t.success, fontWeight: 700, fontSize: '16px',
                background: t.successSubtle, padding: '4px 10px', borderRadius: '20px'
              }}>
                {star.growth}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Category Kings */}
      {activeView === 'category' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {categoryKings.map(cat => (
            <div key={cat.platform} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '12px', padding: '20px', textAlign: 'center',
              boxShadow: t.shadowCard, transition: 'border-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = cat.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${cat.color}22`, border: `1px solid ${cat.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: cat.color, fontWeight: 700, fontSize: '18px'
              }}>
                {cat.icon}
              </div>
              <p style={{ color: t.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Best {cat.platform} Creator</p>
              <p style={{ color: t.textPrimary, fontWeight: 700, fontSize: '16px', margin: '0 0 4px' }}>{cat.king}</p>
              <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{cat.posts} posts</p>
            </div>
          ))}
        </div>
      )}

      {/* Wall of Fame */}
      {activeView === 'fame' && (
        <div>
          <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
            🏆 Top 10 most liked posts of all time
          </p>
          {wallOfFame.map((post, i) => (
            <div key={post.title} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '12px', padding: '16px 20px', marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: t.shadowCard
            }}>
              <span style={{
                fontSize: '24px', fontWeight: 700, color: ['#fbbf24', '#94a3b8', '#f97316'][i],
                width: '32px', textAlign: 'center'
              }}>
                {['🥇', '🥈', '🥉'][i]}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>{post.title}</p>
                <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>by {post.user} · {post.platform}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: t.danger, fontWeight: 700, fontSize: '16px', margin: 0 }}>❤️ {post.likes}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}