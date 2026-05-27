import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user, onProfileClick, onDMClick, onPricingClick }) {
  const { t, mode, toggleTheme } = useTheme();

  return (
    <div style={{
      position: 'fixed', top: 0, left: '240px', right: 0, height: '56px',
      background: t.bg, borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', zIndex: 100
    }}>

      <div style={{ display: 'flex', gap: '4px' }}>
        {['Explore', 'Documentation', 'Pricing'].map(link => (
          <button key={link}
            onClick={link === 'Pricing' ? onPricingClick : undefined}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none',
              background: 'transparent', color: t.textSecondary,
              fontSize: '13px', cursor: 'pointer'
            }}>
            {link}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: t.bgSecondary, border: `1px solid ${t.border}`,
          borderRadius: '8px', padding: '6px 12px', width: '220px'
        }}>
          <span style={{ color: t.textMuted, fontSize: '13px' }}>🔍</span>
          <span style={{ color: t.textMuted, fontSize: '13px', flex: 1 }}>Search or press...</span>
          <span style={{
            background: t.bgTertiary, border: `1px solid ${t.border}`,
            borderRadius: '4px', padding: '1px 6px',
            color: t.textMuted, fontSize: '11px'
          }}>⌘K</span>
        </div>

        <button
          style={{
            background: 'transparent', border: `1px solid ${t.border}`,
            borderRadius: '8px', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.textSecondary, fontSize: '16px', position: 'relative'
          }}>
          🔔
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '6px', height: '6px', borderRadius: '50%',
            background: t.danger
          }} />
        </button>

        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent', border: `1px solid ${t.border}`,
            borderRadius: '8px', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.textSecondary, fontSize: '16px', cursor: 'pointer'
          }}>
          {mode === 'dark' ? '☀️' : '🌙'}
        </button>

        <button
          style={{
            background: 'transparent', border: `1px solid ${t.border}`,
            borderRadius: '8px', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.textSecondary, fontSize: '16px', cursor: 'pointer'
          }}>
          ⚙️
        </button>

        <div
          onClick={onProfileClick}
          style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            border: `2px solid ${t.border}`
          }}>
          {user?.email?.[0]?.toUpperCase()}
        </div>
      </div>
    </div>
  );
}