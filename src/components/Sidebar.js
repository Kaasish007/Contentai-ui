import React from 'react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊙' },
  { id: 'generate', label: 'Generate Content', icon: '✦' },
  { id: 'canvas', label: 'The Canvas', icon: '◈' },
  { id: 'projects', label: 'Projects', icon: '◧' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '◎' },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'help', label: 'Help', icon: '?' },
];

export default function Sidebar({ activePage, setActivePage, starBalance, onStarsClick, user }) {
  const { t } = useTheme();

  const NavItem = ({ item, active }) => (
    <div
      onClick={() => setActivePage(item.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
        background: active ? t.accentSubtle : 'transparent',
        color: active ? t.accent : t.textSecondary,
        borderLeft: active ? `2px solid ${t.accent}` : '2px solid transparent',
        transition: 'all 0.15s', marginBottom: '2px'
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = t.bgHover; e.currentTarget.style.color = t.textPrimary; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textSecondary; } }}
    >
      <span style={{ fontSize: '15px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
      <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400 }}>{item.label}</span>
      {active && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>›</span>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
      background: t.bgSecondary, borderRight: `1px solid ${t.border}`,
      display: 'flex', flexDirection: 'column', padding: '0',
      transition: 'background 0.2s, border-color 0.2s'
    }}>

      {/* Logo */}
      <div style={{
        padding: '20px 16px', borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: t.accent, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontSize: '16px', flexShrink: 0
        }}>
          ⚡
        </div>
        <div>
          <p style={{ color: t.textPrimary, fontWeight: 700, fontSize: '14px', margin: 0 }}>ContentAI</p>
          <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>Spark Plan</p>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} />
        ))}

        <div style={{ borderTop: `1px solid ${t.border}`, margin: '12px 4px' }} />

        {bottomItems.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} />
        ))}
      </div>

      {/* Stars */}
      <div
        onClick={onStarsClick}
        style={{
          margin: '8px', borderRadius: '10px', padding: '12px 14px',
          background: t.bgTertiary, border: `1px solid ${t.border}`,
          cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = t.star}
        onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⭐</span>
            <span style={{ color: t.star, fontSize: '13px', fontWeight: 600 }}>{starBalance || 0} Stars</span>
          </div>
          <span style={{ color: t.textMuted, fontSize: '11px' }}>View →</span>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '8px', borderTop: `1px solid ${t.border}` }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
            color: t.textSecondary, transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = t.dangerSubtle; e.currentTarget.style.color = t.danger; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textSecondary; }}
        >
          <span style={{ fontSize: '15px' }}>→</span>
          <span style={{ fontSize: '13px' }}>Logout</span>
        </div>
      </div>
    </div>
  );
}