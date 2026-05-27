import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabase';

export default function ProfileModal({ user, onClose }) {
  const { t } = useTheme();
  const [activeSection, setActiveSection] = useState('About Me');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [saved, setSaved] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });

  const sections = ['About Me', 'Skill Set', 'Interests', 'Your Works', 'Favourites', 'Subscription'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (data) {
      setBio(data.bio || '');
      setSkills(data.skills || '');
      setSelectedInterests(data.interests ? data.interests.split(',') : []);
    }
  };

  const saveProfile = async () => {
    await supabase.from('profiles').upsert({
      user_id: user.id, bio, skills,
      interests: selectedInterests.join(',')
    }, { onConflict: 'user_id' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: t.bgCard, borderRadius: '16px', width: '780px',
        maxHeight: '85vh', overflow: 'hidden', border: `1px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', boxShadow: t.shadowLg
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', gap: '16px', position: 'relative'
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px',
            background: t.bgTertiary, border: `1px solid ${t.border}`,
            borderRadius: '6px', width: '28px', height: '28px',
            color: t.textSecondary, cursor: 'pointer', fontSize: '14px'
          }}>×</button>

          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '28px', flexShrink: 0
          }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ color: t.textPrimary, fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>
              {user?.email?.split('@')[0]}
            </h2>
            <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 8px' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', background: t.accentSubtle, color: t.accent, border: `1px solid ${t.accent}44` }}>
                🌱 Newcomer
              </span>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', background: t.bgTertiary, color: t.star, border: `1px solid ${t.border}` }}>
                ✏️ Spark Plan
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Posts', value: '0' },
              { label: 'Followers', value: followStats.followers },
              { label: 'Following', value: followStats.following },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ color: t.textPrimary, fontWeight: 700, fontSize: '18px', margin: '0 0 2px' }}>{stat.value}</p>
                <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left Nav */}
          <div style={{ width: '180px', borderRight: `1px solid ${t.border}`, padding: '12px 8px' }}>
            {sections.map(section => (
              <div key={section} onClick={() => setActiveSection(section)} style={{
                padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                background: activeSection === section ? t.accentSubtle : 'transparent',
                color: activeSection === section ? t.accent : t.textSecondary,
                fontSize: '13px', fontWeight: activeSection === section ? 600 : 400,
                borderLeft: activeSection === section ? `2px solid ${t.accent}` : '2px solid transparent',
                marginBottom: '2px', transition: 'all 0.15s'
              }}>
                {section}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

            {activeSection === 'About Me' && (
              <div>
                <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 12px' }}>About Me</h3>
                <textarea value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  style={{
                    width: '100%', height: '100px', background: t.bgSecondary,
                    border: `1px solid ${t.border}`, borderRadius: '8px',
                    color: t.textPrimary, padding: '10px', fontSize: '13px',
                    resize: 'none', outline: 'none', boxSizing: 'border-box'
                  }} />
                <button onClick={saveProfile} style={{
                  marginTop: '10px', padding: '8px 18px', background: saved ? t.success : t.accent,
                  color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}>
                  {saved ? '✅ Saved!' : 'Save'}
                </button>
              </div>
            )}

            {activeSection === 'Skill Set' && (
              <div>
                <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 12px' }}>Skill Set</h3>
                <input value={skills} onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. Content Writing, Social Media, SEO..."
                  style={{
                    width: '100%', padding: '10px 12px', background: t.bgSecondary,
                    border: `1px solid ${t.border}`, borderRadius: '8px',
                    color: t.textPrimary, fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }} />
                <button onClick={saveProfile} style={{
                  marginTop: '10px', padding: '8px 18px', background: saved ? t.success : t.accent,
                  color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}>
                  {saved ? '✅ Saved!' : 'Save Skills'}
                </button>
              </div>
            )}

            {activeSection === 'Interests' && (
              <div>
                <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 12px' }}>Interests</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {['AI & Tech', 'Marketing', 'Design', 'Business', 'Education', 'Health', 'Finance', 'Sports', 'Music', 'Travel'].map(interest => (
                    <span key={interest} onClick={() => toggleInterest(interest)} style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                      background: selectedInterests.includes(interest) ? t.accentSubtle : t.bgSecondary,
                      color: selectedInterests.includes(interest) ? t.accent : t.textSecondary,
                      border: `1px solid ${selectedInterests.includes(interest) ? t.accent : t.border}`,
                      transition: 'all 0.15s'
                    }}>{interest}</span>
                  ))}
                </div>
                <button onClick={saveProfile} style={{
                  padding: '8px 18px', background: saved ? t.success : t.accent,
                  color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}>
                  {saved ? '✅ Saved!' : 'Save Interests'}
                </button>
              </div>
            )}

            {activeSection === 'Your Works' && (
              <div style={{ padding: '40px', textAlign: 'center', border: `1px dashed ${t.border}`, borderRadius: '8px' }}>
                <p style={{ color: t.textMuted, fontSize: '14px' }}>No works yet — start creating! 🎨</p>
              </div>
            )}

            {activeSection === 'Favourites' && (
              <div style={{ padding: '40px', textAlign: 'center', border: `1px dashed ${t.border}`, borderRadius: '8px' }}>
                <p style={{ color: t.textMuted, fontSize: '14px' }}>No favourites yet — explore The Canvas!</p>
              </div>
            )}

            {activeSection === 'Subscription' && (
              <div>
                <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>Subscription</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { name: 'Spark', price: 'Free', color: t.textSecondary, current: true },
                    { name: 'Creator', price: '₹299/mo', color: t.accent, current: false },
                    { name: 'Masterpiece', price: '₹999/mo', color: '#8b5cf6', current: false },
                  ].map(plan => (
                    <div key={plan.name} style={{
                      flex: 1, background: t.bgSecondary, borderRadius: '10px',
                      padding: '16px', textAlign: 'center',
                      border: `1px solid ${plan.current ? plan.color : t.border}`
                    }}>
                      <p style={{ color: plan.color, fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>{plan.name}</p>
                      <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 12px' }}>{plan.price}</p>
                      {plan.current
                        ? <span style={{ color: t.success, fontSize: '12px' }}>✅ Current</span>
                        : <button style={{ padding: '6px 14px', background: plan.color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Upgrade</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}