import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Settings({ user }) {
  const { t, mode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('Account');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showFollowers, setShowFollowers] = useState(true);
  const [showWorks, setShowWorks] = useState(true);
  const [deleteText, setDeleteText] = useState('');

  const sections = ['Account', 'Privacy', 'Notifications', 'Billing', 'Danger Zone'];

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: value ? t.accent : t.bgTertiary,
        border: `1px solid ${value ? t.accent : t.border}`,
        position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: value ? '22px' : '2px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </div>
  );

  const SettingRow = ({ label, desc, children }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0', borderBottom: `1px solid ${t.border}`
    }}>
      <div>
        <p style={{ color: t.textPrimary, fontSize: '14px', fontWeight: 500, margin: '0 0 2px' }}>{label}</p>
        {desc && <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{desc}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>Settings</h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>

        {/* Left Nav */}
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '8px', height: 'fit-content'
        }}>
          {sections.map(section => (
            <div
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                background: activeSection === section ? t.accentSubtle : 'transparent',
                color: activeSection === section ? t.accent : t.textSecondary,
                fontSize: '13px', fontWeight: activeSection === section ? 600 : 400,
                transition: 'all 0.15s',
                borderLeft: activeSection === section ? `2px solid ${t.accent}` : '2px solid transparent'
              }}
            >
              {section === 'Danger Zone' ? '⚠️ ' : ''}{section}
            </div>
          ))}
        </div>

        {/* Right Content */}
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '24px'
        }}>

          {activeSection === 'Account' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Account Settings</h3>

              <SettingRow label="Email Address" desc="Your primary email">
                <span style={{ color: t.textSecondary, fontSize: '13px' }}>{user?.email}</span>
              </SettingRow>

              <SettingRow label="Username" desc="Your display name">
                <input
                  defaultValue={user?.email?.split('@')[0]}
                  style={{
                    padding: '6px 10px', background: t.bgSecondary,
                    border: `1px solid ${t.border}`, borderRadius: '6px',
                    color: t.textPrimary, fontSize: '13px', outline: 'none', width: '160px'
                  }}
                />
              </SettingRow>

              <SettingRow label="Theme" desc="Choose your preferred theme">
                <button
                  onClick={toggleTheme}
                  style={{
                    padding: '6px 14px', background: t.bgSecondary,
                    border: `1px solid ${t.border}`, borderRadius: '6px',
                    color: t.textPrimary, fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              </SettingRow>

              <SettingRow label="Contribution Rank" desc="Earned through activity">
                <span style={{
                  padding: '4px 12px', borderRadius: '20px',
                  background: t.accentSubtle, color: t.accent,
                  fontSize: '12px', fontWeight: 600
                }}>🌱 Newcomer</span>
              </SettingRow>

              <SettingRow label="Change Password" desc="Update your password">
                <button style={{
                  padding: '6px 14px', background: t.bgSecondary,
                  border: `1px solid ${t.border}`, borderRadius: '6px',
                  color: t.textPrimary, fontSize: '13px', cursor: 'pointer'
                }}>
                  Update Password
                </button>
              </SettingRow>
            </div>
          )}

          {activeSection === 'Privacy' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Privacy Settings</h3>
              <SettingRow label="Private Profile" desc="Only followers can see your content">
                <Toggle value={isPrivate} onChange={setIsPrivate} />
              </SettingRow>
              <SettingRow label="Show on Leaderboard" desc="Allow your name to appear in rankings">
                <Toggle value={showLeaderboard} onChange={setShowLeaderboard} />
              </SettingRow>
              <SettingRow label="Show Followers List" desc="Let others see who follows you">
                <Toggle value={showFollowers} onChange={setShowFollowers} />
              </SettingRow>
              <SettingRow label="Show My Works" desc="Display your content publicly">
                <Toggle value={showWorks} onChange={setShowWorks} />
              </SettingRow>
            </div>
          )}

          {activeSection === 'Notifications' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Notification Settings</h3>
              <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>Site Notifications</p>
              {['Star count alerts', 'Like notifications', 'Comment notifications', 'DM notifications'].map(item => (
                <SettingRow key={item} label={item}>
                  <Toggle value={true} onChange={() => {}} />
                </SettingRow>
              ))}
              <p style={{ color: t.textSecondary, fontSize: '13px', margin: '16px 0' }}>Email Notifications</p>
              {['Recent platform updates', 'Weekly digest'].map(item => (
                <SettingRow key={item} label={item}>
                  <Toggle value={false} onChange={() => {}} />
                </SettingRow>
              ))}
            </div>
          )}

          {activeSection === 'Billing' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Billing & Plans</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { name: 'Spark', price: 'Free', color: t.textSecondary, current: true },
                  { name: 'Creator', price: '₹299/mo', color: t.accent, current: false },
                  { name: 'Masterpiece', price: '₹999/mo', color: '#8b5cf6', current: false },
                ].map(plan => (
                  <div key={plan.name} style={{
                    background: t.bgSecondary, border: `1px solid ${plan.current ? plan.color : t.border}`,
                    borderRadius: '10px', padding: '16px', textAlign: 'center'
                  }}>
                    <p style={{ color: plan.color, fontWeight: 700, fontSize: '16px', margin: '0 0 4px' }}>{plan.name}</p>
                    <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 12px' }}>{plan.price}</p>
                    {plan.current
                      ? <span style={{ color: t.success, fontSize: '12px' }}>✅ Current Plan</span>
                      : <button style={{ padding: '6px 16px', background: plan.color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Upgrade</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Danger Zone' && (
            <div>
              <h3 style={{ color: t.danger, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>⚠️ Danger Zone</h3>
              <div style={{
                background: t.dangerSubtle, border: `1px solid ${t.danger}44`,
                borderRadius: '10px', padding: '20px'
              }}>
                <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>Delete Account</p>
                <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
                  This action is permanent and cannot be undone. All your data will be deleted.
                </p>
                <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 8px' }}>
                  Type <strong style={{ color: t.danger }}>Yes</strong> to confirm:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={deleteText}
                    onChange={e => setDeleteText(e.target.value)}
                    placeholder="Type Yes to confirm"
                    style={{
                      padding: '8px 12px', background: t.bgSecondary,
                      border: `1px solid ${t.border}`, borderRadius: '6px',
                      color: t.textPrimary, fontSize: '13px', outline: 'none'
                    }}
                  />
                  <button
                    disabled={deleteText !== 'Yes'}
                    style={{
                      padding: '8px 16px',
                      background: deleteText === 'Yes' ? t.danger : t.bgTertiary,
                      color: deleteText === 'Yes' ? 'white' : t.textMuted,
                      border: 'none', borderRadius: '6px',
                      fontSize: '13px', cursor: deleteText === 'Yes' ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}