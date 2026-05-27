import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const platformColors = {
  LinkedIn: '#0a66c2', Twitter: '#1d9bf0',
  Instagram: '#e1306c', YouTube: '#ff0000', Blog: '#22c55e'
};

export default function Projects({ onNavigate }) {
  const { t } = useTheme();
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'Blog'];

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
            Projects
          </h1>
          <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
            Your saved content and generation history
          </p>
        </div>
        <button
          onClick={() => onNavigate('generate')}
          style={{
            padding: '10px 20px', background: t.accent, color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px'
          }}
        >
          ⚡ New Generation
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              border: `1px solid ${filter === f ? t.accent : t.border}`,
              background: filter === f ? t.accentSubtle : 'transparent',
              color: filter === f ? t.accent : t.textSecondary,
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div style={{
        background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: '12px', padding: '80px 40px', textAlign: 'center',
        boxShadow: t.shadowCard
      }}>
        <p style={{ fontSize: '48px', margin: '0 0 16px' }}>◧</p>
        <h3 style={{ color: t.textPrimary, fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
          No projects yet
        </h3>
        <p style={{ color: t.textSecondary, fontSize: '14px', margin: '0 0 20px' }}>
          Start generating content to see your projects here
        </p>
        <button
          onClick={() => onNavigate('generate')}
          style={{
            padding: '10px 24px', background: t.accent, color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          Generate Your First Content
        </button>
      </div>
    </div>
  );
}