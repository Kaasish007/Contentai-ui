import React from 'react';
import { useTheme } from '../context/ThemeContext';
import logoImage from './logo.png';
import { useLanguage } from '../context/LanguageContext';

const navItems = [
  { id: 'dashboard', labelKey: 'dashboard', icon: '⊙' },
  { id: 'generate', labelKey: 'generate', icon: '✦' },
  { id: 'canvas', labelKey: 'canvas', icon: '◈' },
  { id: 'projects', labelKey: 'projects', icon: '◧' },
  { id: 'leaderboard', labelKey: 'leaderboard', icon: '◎' },
  { id: 'analytics', labelKey: 'analytics', icon: '📊' },
];

const bottomItems = [
  { id: 'settings', labelKey: 'settings', icon: '⚙' },
  { id: 'help', labelKey: 'help', icon: '?' },
];

export default function Sidebar({ activePage, setActivePage, starBalance, onStarsClick, user, onLogout }) {
  const { t: theme } = useTheme();
  const { l } = useLanguage();

  const NavItem = ({ item, active }) => (
    <div
      onClick={() => setActivePage(item.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
        background: active ? theme.accentSubtle : 'transparent',
        color: active ? theme.accent : theme.textSecondary,
        borderLeft: active ? `2px solid ${theme.accent}` : '2px solid transparent',
        transition: 'all 0.15s', marginBottom: '2px'
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = theme.bgHover; e.currentTarget.style.color = theme.textPrimary; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary; } }}
    >
      <span style={{ fontSize: '15px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
      <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400 }}>{l[item.labelKey]}</span>
      {active && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>›</span>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
      background: theme.bgSecondary, borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', padding: '0',
      transition: 'background 0.2s, border-color 0.2s'
    }}>

      {/* Logo */}
      <div style={{
        padding: '20px 16px', borderBottom: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <img src={logoImage} alt="Creaze" style={{
          width: '36px', height: '36px', borderRadius: '8px',
          objectFit: 'contain', flexShrink: 0
        }} />
        <div>
          <p style={{ color: theme.textPrimary, fontWeight: 700, fontSize: '14px', margin: 0 }}>Creaze</p>
          <p style={{ color: theme.textMuted, fontSize: '11px', margin: 0 }}>Spark Plan</p>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} />
        ))}

        <div style={{ borderTop: `1px solid ${theme.border}`, margin: '12px 4px' }} />

        {bottomItems.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} />
        ))}
      </div>

      {/* Stars */}
      <div
        onClick={onStarsClick}
        style={{
          margin: '8px', borderRadius: '10px', padding: '12px 14px',
          background: theme.bgTertiary, border: `1px solid ${theme.border}`,
          cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = theme.star}
        onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⭐</span>
            <span style={{ color: theme.star, fontSize: '13px', fontWeight: 600 }}>{starBalance || 0} {l.stars}</span>
          </div>
          <span style={{ color: theme.textMuted, fontSize: '11px' }}>View →</span>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '8px', borderTop: `1px solid ${theme.border}` }}>
        <div
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
            color: theme.textSecondary, transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.dangerSubtle; e.currentTarget.style.color = theme.danger; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary; }}
        >
          <span style={{ fontSize: '15px' }}>→</span>
          <span style={{ fontSize: '13px' }}>{l.logout}</span>
        </div>
      </div>
    </div>
  );
}
