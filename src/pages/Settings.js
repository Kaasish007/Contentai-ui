import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../utils/supabase';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const RANKS = [
  { name: 'Icon', emoji: '🌟', min: 1000 },
  { name: 'Legend', emoji: '👑', min: 500 },
  { name: 'Visionary', emoji: '💎', min: 150 },
  { name: 'Stellar', emoji: '⭐', min: 50 },
  { name: 'Blazer', emoji: '🔥', min: 10 },
  { name: 'Newcomer', emoji: '🌱', min: 0 },
];

export default function Settings({ user, onNavigate }) {
  const { t, mode, toggleTheme } = useTheme();
  const { language, changeLanguage, l } = useLanguage();
  const [activeSection, setActiveSection] = useState('Account');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showFollowers, setShowFollowers] = useState(true);
  const [showWorks, setShowWorks] = useState(true);
  const [deleteText, setDeleteText] = useState('');
  const [currentPlan, setCurrentPlan] = useState('spark');
  const [currentRank, setCurrentRank] = useState('🌱 Newcomer');
  const [loadingPlan, setLoadingPlan] = useState(true);

  const sections = [l.account, l.privacy, l.notifications, l.billing, l.language, l.dangerZone];

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ];

  useEffect(() => {
    fetchPlanAndRank();
  }, []);

  const fetchPlanAndRank = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${BACKEND}/api/stripe/my-plan`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const planData = await res.json();
      if (planData.plan) setCurrentPlan(planData.plan);

      const { data: profile } = await supabase
        .from('profiles')
        .select('rank')
        .eq('user_id', session.user.id)
        .single();
      if (profile?.rank) setCurrentRank(profile.rank);
    } catch (err) {
      console.error('Settings fetch error:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleUpgrade = async (plan) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${BACKEND}/api/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Upgrade error:', err);
    }
  };

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

  const planMeta = {
    spark: { label: 'Spark', color: '#94a3b8', icon: '✏️' },
    creator: { label: 'Creator', color: '#3b82f6', icon: '🎨' },
    masterpiece: { label: 'Masterpiece', color: '#a855f7', icon: '🌌' },
  };

  // Map translated section names back to keys for rendering
  const sectionKey = () => {
    if (activeSection === l.account) return 'Account';
    if (activeSection === l.privacy) return 'Privacy';
    if (activeSection === l.notifications) return 'Notifications';
    if (activeSection === l.billing) return 'Billing';
    if (activeSection === l.language) return 'Language';
    if (activeSection === l.dangerZone) return 'Danger Zone';
    return activeSection;
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>{l.settingsTitle}</h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>{l.settingsDesc}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
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
              {section === l.dangerZone ? '⚠️ ' : ''}{section}
            </div>
          ))}
        </div>

        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '24px'
        }}>

          {sectionKey() === 'Account' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>{l.account}</h3>
              <SettingRow label={l.emailAddress} desc={l.primaryEmail}>
                <span style={{ color: t.textSecondary, fontSize: '13px' }}>{user?.email}</span>
              </SettingRow>
              <SettingRow label={l.username} desc={l.displayName}>
                <input
                  defaultValue={user?.email?.split('@')[0]}
                  style={{
                    padding: '6px 10px', background: t.bgSecondary,
                    border: `1px solid ${t.border}`, borderRadius: '6px',
                    color: t.textPrimary, fontSize: '13px', outline: 'none', width: '160px'
                  }}
                />
              </SettingRow>
              <SettingRow label={l.theme} desc={l.preferredTheme}>
                <button
                  onClick={toggleTheme}
                  style={{
                    padding: '6px 14px', background: t.bgSecondary,
                    border: `1px solid ${t.border}`, borderRadius: '6px',
                    color: t.textPrimary, fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {mode === 'dark' ? `🌙 ${l.dark}` : `☀️ ${l.light}`}
                </button>
              </SettingRow>
              <SettingRow label={l.contributionRank} desc={l.rankDesc}>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px',
                  background: t.accentSubtle, color: t.accent,
                  fontSize: '12px', fontWeight: 600
                }}>
                  {currentRank}
                </span>
              </SettingRow>
              <SettingRow label={l.currentPlan} desc={l.subscriptionPlan}>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px',
                  background: `${planMeta[currentPlan]?.color}22`,
                  color: planMeta[currentPlan]?.color,
                  fontSize: '12px', fontWeight: 600
                }}>
                  {planMeta[currentPlan]?.icon} {planMeta[currentPlan]?.label}
                </span>
              </SettingRow>
              <SettingRow label={l.changePassword} desc="">
                <button style={{
                  padding: '6px 14px', background: t.bgSecondary,
                  border: `1px solid ${t.border}`, borderRadius: '6px',
                  color: t.textPrimary, fontSize: '13px', cursor: 'pointer'
                }}>
                  {l.updatePassword}
                </button>
              </SettingRow>
            </div>
          )}

          {sectionKey() === 'Privacy' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>{l.privacy}</h3>
              <SettingRow label={l.privateProfile} desc={l.privateProfileDesc}>
                <Toggle value={isPrivate} onChange={setIsPrivate} />
              </SettingRow>
              <SettingRow label={l.showLeaderboard} desc={l.showLeaderboardDesc}>
                <Toggle value={showLeaderboard} onChange={setShowLeaderboard} />
              </SettingRow>
              <SettingRow label={l.showFollowers} desc={l.showFollowersDesc}>
                <Toggle value={showFollowers} onChange={setShowFollowers} />
              </SettingRow>
              <SettingRow label={l.showWorks} desc={l.showWorksDesc}>
                <Toggle value={showWorks} onChange={setShowWorks} />
              </SettingRow>
            </div>
          )}

          {sectionKey() === 'Notifications' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>{l.notifications}</h3>
              <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>{l.siteNotifications}</p>
              {[l.starAlerts, l.likeNotifications, l.commentNotifications, l.dmNotifications].map(item => (
                <SettingRow key={item} label={item}>
                  <Toggle value={true} onChange={() => {}} />
                </SettingRow>
              ))}
              <p style={{ color: t.textSecondary, fontSize: '13px', margin: '16px 0' }}>{l.emailNotifications}</p>
              {[l.platformUpdates, l.weeklyDigest].map(item => (
                <SettingRow key={item} label={item}>
                  <Toggle value={false} onChange={() => {}} />
                </SettingRow>
              ))}
            </div>
          )}

          {sectionKey() === 'Billing' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>{l.billingPlans}</h3>
              <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 20px' }}>
                {l.currentPlanLabel}: <strong style={{ color: planMeta[currentPlan]?.color }}>
                  {planMeta[currentPlan]?.icon} {planMeta[currentPlan]?.label}
                </strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { id: 'spark', name: 'Spark', price: 'Free', color: '#94a3b8', icon: '✏️' },
                  { id: 'creator', name: 'Creator', price: '₹299/mo', color: '#3b82f6', icon: '🎨' },
                  { id: 'masterpiece', name: 'Masterpiece', price: '₹999/mo', color: '#a855f7', icon: '🌌' },
                ].map(plan => {
                  const isCurrent = currentPlan === plan.id;
                  return (
                    <div key={plan.id} style={{
                      background: t.bgSecondary,
                      border: `1px solid ${isCurrent ? plan.color : t.border}`,
                      borderRadius: '10px', padding: '16px', textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '22px', margin: '0 0 4px' }}>{plan.icon}</p>
                      <p style={{ color: plan.color, fontWeight: 700, fontSize: '16px', margin: '0 0 4px' }}>{plan.name}</p>
                      <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 12px' }}>{plan.price}</p>
                      {isCurrent
                        ? <span style={{ color: t.success, fontSize: '12px' }}>✅ {l.currentPlanLabel}</span>
                        : plan.id !== 'spark' && (
                          <button
                            onClick={() => handleUpgrade(plan.id)}
                            style={{
                              padding: '6px 16px', background: plan.color,
                              color: 'white', border: 'none', borderRadius: '6px',
                              cursor: 'pointer', fontSize: '12px', fontWeight: 600
                            }}
                          >
                            {l.upgrade}
                          </button>
                        )
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sectionKey() === 'Language' && (
            <div>
              <h3 style={{ color: t.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>{l.selectLanguage}</h3>
              <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 20px' }}>{l.languageDesc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {languages.map(lang => (
                  <div
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                      border: `1px solid ${language === lang.code ? t.accent : t.border}`,
                      background: language === lang.code ? t.accentSubtle : t.bgSecondary,
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '22px' }}>{lang.flag}</span>
                      <span style={{
                        color: language === lang.code ? t.accent : t.textPrimary,
                        fontWeight: language === lang.code ? 600 : 400,
                        fontSize: '14px'
                      }}>
                        {lang.label}
                      </span>
                    </div>
                    {language === lang.code && (
                      <span style={{
                        color: t.accent, fontSize: '16px', fontWeight: 700
                      }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sectionKey() === 'Danger Zone' && (
            <div>
              <h3 style={{ color: t.danger, fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>⚠️ {l.dangerZone}</h3>
              <div style={{
                background: t.dangerSubtle, border: `1px solid ${t.danger}44`,
                borderRadius: '10px', padding: '20px'
              }}>
                <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>{l.deleteAccount}</p>
                <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>{l.deleteDesc}</p>
                <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 8px' }}>{l.typeYes}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={deleteText}
                    onChange={e => setDeleteText(e.target.value)}
                    placeholder={l.typeYesPlaceholder}
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
                    {l.deleteAccount}
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