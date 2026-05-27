import React from 'react';
import { useTheme } from '../context/ThemeContext';

const stats = [
  { label: 'Total Generated', value: '0', change: '+0%', icon: '⚡', period: 'Last 30 days' },
  { label: 'Saved Templates', value: '0', change: '+0', icon: '◧', period: 'Last 30 days' },
  { label: 'API Calls', value: '0', change: '+0%', icon: '↗', period: 'Last 30 days' },
  { label: 'Avg. Quality Score', value: '—', change: '+0%', icon: '▦', period: 'Last 30 days' },
];

export default function Dashboard({ user, onNavigate }) {
  const { t } = useTheme();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
          Dashboard
        </h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
          Welcome back, {user?.email?.split('@')[0]}. Here's your AI content generation overview.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: t.accent, fontSize: '18px' }}>{stat.icon}</span>
              <span style={{ color: t.success, fontSize: '12px', fontWeight: 600 }}>↗ {stat.change}</span>
            </div>
            <p style={{ color: t.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>{stat.label}</p>
            <p style={{ color: t.textPrimary, fontSize: '28px', fontWeight: 700, margin: '0 0 4px' }}>{stat.value}</p>
            <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>{stat.period}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>

        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 2px' }}>Recent Activity</h3>
              <p style={{ color: t.textSecondary, fontSize: '12px', margin: 0 }}>Your latest content generations</p>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: t.accent, fontSize: '13px', cursor: 'pointer' }}>
              View All
            </button>
          </div>

          <div style={{ padding: '40px', textAlign: 'center', border: `1px dashed ${t.border}`, borderRadius: '8px' }}>
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
        </div>

        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
        }}>
          <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>
            Quick Actions
          </h3>

          {[
            { label: 'New Generation', icon: '⚡', action: 'generate' },
            { label: 'Browse Canvas', icon: '◈', action: 'canvas' },
            { label: 'View Leaderboard', icon: '◎', action: 'leaderboard' },
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
              <span style={{ color: t.accent, fontSize: '16px' }}>{item.icon}</span>
              <span style={{ color: t.textPrimary, fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', color: t.textMuted }}>›</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: '16px', padding: '20px 24px',
        background: `linear-gradient(135deg, ${t.accent}15, #8b5cf615)`,
        border: `1px solid ${t.accent}30`, borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
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
          fontWeight: 600, cursor: 'pointer'
        }}>
          Upgrade Now
        </button>
      </div>
    </div>
  );
}