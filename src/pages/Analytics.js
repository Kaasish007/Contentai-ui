import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabase';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const platformColors = {
  linkedin: '#0a66c2', twitter: '#1d9bf0',
  instagram: '#e1306c', youtube: '#ff0000',
  blog: '#22c55e', newsletter: '#f59e0b'
};

const platformEmoji = {
  linkedin: '💼', twitter: '🐦', instagram: '📸',
  youtube: '▶️', blog: '📝', newsletter: '📧'
};

export default function Analytics({ user, onNavigate }) {
  const { t } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${BACKEND}/api/dashboard/analytics`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const json = await res.json();
      if (res.status === 403) { setBlocked(true); return; }
      if (!json.error) setData(json);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const Bar = ({ value, max, color }) => (
    <div style={{
      flex: 1, height: '8px', background: t.bgTertiary,
      borderRadius: '4px', overflow: 'hidden'
    }}>
      <div style={{
        height: '100%', borderRadius: '4px',
        width: `${max > 0 ? (value / max) * 100 : 0}%`,
        background: color, transition: 'width 0.6s ease'
      }} />
    </div>
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: t.textMuted }}>
      Loading analytics...
    </div>
  );

  if (blocked) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🌌</p>
      <h2 style={{ color: t.textPrimary, fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
        Analytics is a Masterpiece Feature
      </h2>
      <p style={{ color: t.textSecondary, fontSize: '14px', margin: '0 0 24px' }}>
        Upgrade to Masterpiece to unlock detailed analytics on your content performance.
      </p>
      <button
        onClick={() => onNavigate('settings')}
        style={{
          padding: '12px 28px', background: '#a855f7', color: 'white',
          border: 'none', borderRadius: '10px', fontSize: '14px',
          fontWeight: 600, cursor: 'pointer'
        }}
      >
        Upgrade to Masterpiece — ₹999/mo
      </button>
    </div>
  );

  const platformEntries = Object.entries(data?.platformCounts || {});
  const maxPlatform = Math.max(...platformEntries.map(([, v]) => v), 1);

  const dayEntries = Object.entries(data?.dayCounts || {}).slice(-14);
  const maxDay = Math.max(...dayEntries.map(([, v]) => v), 1);

  const maxWeekStars = Math.max(...(data?.weeklyStars || []).map(w => w.stars), 1);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
          Analytics
        </h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
          Your content performance at a glance
        </p>
      </div>

      {/* Top Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '24px'
      }}>
        {[
          { label: 'Total Generated', value: Object.values(data?.platformCounts || {}).reduce((a, b) => a + b, 0), icon: '⚡' },
          { label: 'Total Likes', value: data?.totalLikes || 0, icon: '❤️' },
          { label: 'Total Followers', value: data?.totalFollowers || 0, icon: '👥' },
          { label: 'Canvas Posts', value: data?.canvasPosts?.length || 0, icon: '🎨' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '18px', boxShadow: t.shadowCard
          }}>
            <span style={{ fontSize: '22px' }}>{stat.icon}</span>
            <p style={{ color: t.textPrimary, fontSize: '28px', fontWeight: 700, margin: '8px 0 2px' }}>
              {stat.value}
            </p>
            <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Platform Breakdown */}
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
        }}>
          <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>
            📊 Content by Platform
          </h3>
          {platformEntries.length === 0 ? (
            <p style={{ color: t.textMuted, fontSize: '13px' }}>No data yet</p>
          ) : (
            platformEntries.map(([platform, count]) => (
              <div key={platform} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: t.textPrimary, fontSize: '13px' }}>
                    {platformEmoji[platform] || '📄'} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </span>
                  <span style={{ color: t.textSecondary, fontSize: '13px', fontWeight: 600 }}>{count}</span>
                </div>
                <Bar value={count} max={maxPlatform} color={platformColors[platform] || t.accent} />
              </div>
            ))
          )}
        </div>

        {/* Weekly Stars */}
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
        }}>
          <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>
            ⭐ Stars Earned (Last 4 Weeks)
          </h3>
          {(data?.weeklyStars || []).map((week) => (
            <div key={week.week} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: t.textPrimary, fontSize: '13px' }}>{week.week}</span>
                <span style={{ color: t.textSecondary, fontSize: '13px', fontWeight: 600 }}>⭐ {week.stars}</span>
              </div>
              <Bar value={week.stars} max={maxWeekStars} color="#f59e0b" />
            </div>
          ))}
        </div>
      </div>

      {/* Daily Activity (last 14 days) */}
      <div style={{
        background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard,
        marginBottom: '16px'
      }}>
        <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>
          📅 Daily Generations (Last 14 Days)
        </h3>
        {dayEntries.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: '13px' }}>No activity in the last 14 days</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {dayEntries.map(([day, count]) => (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  background: t.accent,
                  height: `${(count / maxDay) * 60}px`,
                  minHeight: count > 0 ? '4px' : '0',
                  transition: 'height 0.4s ease'
                }} />
                <span style={{ color: t.textMuted, fontSize: '9px', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  {day.slice(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Canvas Posts */}
      <div style={{
        background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
      }}>
        <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>
          🏆 Top Canvas Posts by Likes
        </h3>
        {data?.canvasPosts?.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: '13px' }}>No canvas posts yet</p>
        ) : (
          data?.canvasPosts?.map((post, i) => (
            <div key={post.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '12px', background: t.bgSecondary,
              borderRadius: '8px', marginBottom: '8px',
              border: `1px solid ${t.border}`
            }}>
              <span style={{
                color: i === 0 ? '#f59e0b' : t.textMuted,
                fontWeight: 700, fontSize: '16px', flexShrink: 0, minWidth: '20px'
              }}>
                #{i + 1}
              </span>
              <p style={{
                color: t.textPrimary, fontSize: '13px', flex: 1,
                margin: 0, lineHeight: '1.5',
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {post.content}
              </p>
              <span style={{
                color: t.danger, fontSize: '13px',
                fontWeight: 600, flexShrink: 0
              }}>
                ❤️ {post.likes || 0}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}