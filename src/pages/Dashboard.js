import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const BACKEND = 'http://localhost:5000';

const platformIcons = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📸',
  blog: '📝',
  newsletter: '📧'
};

export default function Dashboard({ user, onNavigate }) {
  const { t } = useTheme();
  const isMobile = window.innerWidth < 768;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token') ||
          (await import('@supabase/supabase-js'))
            .createClient(
              process.env.REACT_APP_SUPABASE_URL,
              process.env.REACT_APP_SUPABASE_ANON_KEY
            );

        // Get session token from supabase directly
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.REACT_APP_SUPABASE_URL,
          process.env.REACT_APP_SUPABASE_ANON_KEY
        );
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`${BACKEND}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const data = await res.json();
        if (!data.error) setStats(data);
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Generated',
      value: loading ? '...' : stats?.totalGenerated ?? 0,
      change: loading ? '' : `+${stats?.generatedThisMonth ?? 0} this month`,
      icon: '⚡',
      period: 'All time'
    },
    {
      label: 'Followers',
      value: loading ? '...' : stats?.followersCount ?? 0,
      change: '',
      icon: '👥',
      period: 'Total followers'
    },
    {
      label: 'Stars This Week',
      value: loading ? '...' : stats?.starsThisWeek ?? 0,
      change: loading ? '' : `${stats?.totalStars ?? 0} total`,
      icon: '⭐',
      period: 'Last 7 days'
    },
    {
      label: 'Daily Usage',
      value: loading ? '...' : `${stats?.todayCount ?? 0}/${stats?.dailyLimit ?? 5}`,
      change: loading ? '' : stats?.todayCount >= stats?.dailyLimit ? '🔴 Limit reached' : '🟢 Available',
      icon: '📊',
      period: 'Today'
    },
  ];

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: isMobile ? '24px' : '32px', fontWeight: 700, margin: '0 0 6px' }}>
          Dashboard
        </h1>
        <p style={{ color: t.textSecondary, fontSize: '14px', margin: 0 }}>
          Welcome back, {user?.email?.split('@')[0]}. Here's your AI content generation overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '16px'
      }}>
        {statCards.map(stat => (
          <div key={stat.label} style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '16px', boxShadow: t.shadowCard
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>{stat.icon}</span>
              {stat.change && (
                <span style={{ color: t.success, fontSize: '11px', fontWeight: 600 }}>{stat.change}</span>
              )}
            </div>
            <p style={{ color: t.textSecondary, fontSize: '11px', margin: '0 0 2px' }}>{stat.label}</p>
            <p style={{ color: t.textPrimary, fontSize: isMobile ? '22px' : '28px', fontWeight: 700, margin: '0 0 2px' }}>
              {stat.value}
            </p>
            <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>{stat.period}</p>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
        gap: '16px'
      }}>
        {/* Recent Activity */}
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 2px' }}>Recent Activity</h3>
              <p style={{ color: t.textSecondary, fontSize: '12px', margin: 0 }}>Your latest content generations</p>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              style={{ background: 'transparent', border: 'none', color: t.accent, fontSize: '13px', cursor: 'pointer' }}>
              View All
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: t.textMuted, fontSize: '14px' }}>Loading activity...</p>
            </div>
          ) : stats?.recentActivity?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.recentActivity.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 12px', background: t.bgSecondary,
                  borderRadius: '8px', border: `1px solid ${t.border}`
                }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{platformIcons[item.output_type] || '📄'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: t.textPrimary, fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' }}>
                        {item.output_type} content
                      </span>
                      <span style={{ color: t.textMuted, fontSize: '11px', flexShrink: 0, marginLeft: '8px' }}>
                        {formatTime(item.created_at)}
                      </span>
                    </div>
                    <p style={{
                      color: t.textSecondary, fontSize: '12px', margin: '2px 0 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {item.content?.slice(0, 80)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', border: `1px dashed ${t.border}`, borderRadius: '8px' }}>
              <p style={{ color: t.textMuted, fontSize: '14px', margin: '0 0 12px' }}>No content generated yet</p>
              <button
                onClick={() => onNavigate('generate')}
                style={{
                  padding: '8px 16px', background: t.accent,
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer'
                }}>
                Generate Your First Content
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
        }}>
          <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>
            Quick Actions
          </h3>
          {[
            { label: 'New Generation', icon: '⚡', action: 'generate' },
            { label: 'Browse Canvas', icon: '◈', action: 'canvas' },
            { label: 'View Projects', icon: '📁', action: 'projects' },
            { label: 'Leaderboard', icon: '◎', action: 'leaderboard' },
          ].map(item => (
            <div
              key={item.label}
              onClick={() => onNavigate(item.action)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                background: t.bgSecondary, border: `1px solid ${t.border}`,
                marginBottom: '8px', transition: 'all 0.15s'
              }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ color: t.textPrimary, fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', color: t.textMuted }}>›</span>
            </div>
          ))}

          {/* Stars summary */}
          <div style={{
            marginTop: '12px', padding: '12px',
            background: `linear-gradient(135deg, ${t.accent}15, #8b5cf615)`,
            border: `1px solid ${t.accent}30`, borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: t.textMuted, fontSize: '11px', margin: '0 0 4px' }}>Your Star Balance</p>
            <p style={{ color: t.textPrimary, fontSize: '22px', fontWeight: 700, margin: 0 }}>
              ⭐ {loading ? '...' : stats?.totalStars ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div style={{
        marginTop: '16px', padding: isMobile ? '16px' : '20px 24px',
        background: `linear-gradient(135deg, ${t.accent}15, #8b5cf615)`,
        border: `1px solid ${t.accent}30`, borderRadius: '12px',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', gap: '12px'
      }}>
        <div>
          <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '15px', margin: '0 0 4px' }}>
            Upgrade to Creator
          </p>
          <p style={{ color: t.textSecondary, fontSize: '13px', margin: 0 }}>
            Get unlimited AI generations and priority support
          </p>
        </div>
        <button style={{
          padding: '10px 20px', background: t.accent, color: 'white',
          border: 'none', borderRadius: '8px', fontSize: '13px',
          fontWeight: 600, cursor: 'pointer', flexShrink: 0,
          width: isMobile ? '100%' : 'auto'
        }}>
          Upgrade Now
        </button>
      </div>
    </div>
  );
}