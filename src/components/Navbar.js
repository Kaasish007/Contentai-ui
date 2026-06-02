import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../utils/supabase';

export default function Navbar({ user, onProfileClick, onDMClick, onPricingClick, onSettingsClick, onNotificationsClick, onMenuClick, isMobile, onExploreClick }) {
  const { t, mode, toggleTheme } = useTheme();
  const { language, changeLanguage, l } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'ta', label: 'தமிழ்', full: 'Tamil' },
    { code: 'hi', label: 'हिंदी', full: 'Hindi' },
  ];

  useEffect(() => {
    if (!user?.id) return;
    fetchUnreadCount();

    const channel = supabase
      .channel('navbar-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  const fetchUnreadCount = async () => {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(count || 0);
    } catch (err) {
      console.log('Unread count error:', err);
    }
  };

  const handleNotificationsClick = () => {
    setUnreadCount(0);
    onNotificationsClick();
  };

  return (
    <div style={{
      position: 'fixed', top: 0,
      left: isMobile ? '0' : '240px',
      right: 0, height: '56px',
      background: t.bg, borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', zIndex: 100,
      transition: 'background 0.2s, border-color 0.2s'
    }}>

      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {isMobile && (
          <button
            onClick={onMenuClick}
            style={{
              background: 'transparent', border: `1px solid ${t.border}`,
              borderRadius: '8px', width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.textPrimary, fontSize: '18px', cursor: 'pointer',
              flexShrink: 0
            }}
          >
            ☰
          </button>
        )}

        {!isMobile && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {[l.explore, l.documentation, l.pricing].map((link, i) => (
              <button key={link}
                onClick={i === 2 ? onPricingClick : i === 0 ? onExploreClick : undefined}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: 'transparent', color: t.textSecondary,
                  fontSize: '13px', fontWeight: 400, cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textSecondary; }}
              >
                {link}
              </button>
            ))}
          </div>
        )}

        {isMobile && (
          <span style={{ color: t.textPrimary, fontWeight: 700, fontSize: '15px' }}>
            Creaze
          </span>
        )}
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

        {!isMobile && (
          searchOpen ? (
            <div style={{ position: 'relative' }}>
              <input
                autoFocus
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onBlur={() => { setSearchOpen(false); setSearchText(''); }}
                placeholder={l.searchPlaceholder}
                style={{
                  width: '260px', padding: '6px 12px 6px 32px',
                  background: t.bgSecondary, border: `1px solid ${t.accent}`,
                  borderRadius: '8px', color: t.textPrimary, fontSize: '13px',
                  outline: 'none'
                }}
              />
              <span style={{
                position: 'absolute', left: '10px', top: '50%',
                transform: 'translateY(-50%)', color: t.textMuted, fontSize: '13px'
              }}>🔍</span>
            </div>
          ) : (
            <div
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: t.bgSecondary, border: `1px solid ${t.border}`,
                borderRadius: '8px', padding: '6px 12px', width: '220px',
                cursor: 'text', transition: 'border-color 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
            >
              <span style={{ color: t.textMuted, fontSize: '13px' }}>🔍</span>
              <span style={{ color: t.textMuted, fontSize: '13px', flex: 1 }}>{l.search}</span>
              <span style={{
                background: t.bgTertiary, border: `1px solid ${t.border}`,
                borderRadius: '4px', padding: '1px 6px',
                color: t.textMuted, fontSize: '11px', fontWeight: 500
              }}>⌘K</span>
            </div>
          )
        )}

        {/* Language Toggle */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            title="Change Language"
            style={{
              background: 'transparent', border: `1px solid ${t.border}`,
              borderRadius: '8px', padding: '0 10px', height: '34px',
              display: 'flex', alignItems: 'center', gap: '4px',
              color: t.textSecondary, fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textSecondary; }}
          >
            🌐 {languages.find(lang => lang.code === language)?.label}
          </button>

          {showLangMenu && (
            <div style={{
              position: 'absolute', top: '40px', right: 0,
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '10px', padding: '6px', zIndex: 200,
              minWidth: '130px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              {languages.map(lang => (
                <div
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setShowLangMenu(false); }}
                  style={{
                    padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                    color: language === lang.code ? t.accent : t.textPrimary,
                    background: language === lang.code ? t.accentSubtle : 'transparent',
                    fontSize: '13px', fontWeight: language === lang.code ? 600 : 400,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { if (language !== lang.code) e.currentTarget.style.background = t.bgTertiary; }}
                  onMouseLeave={e => { if (language !== lang.code) e.currentTarget.style.background = 'transparent'; }}
                >
                  {language === lang.code && <span>✓</span>}
                  {lang.full} ({lang.label})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications bell */}
        <button
          onClick={handleNotificationsClick}
          style={{
            background: 'transparent', border: `1px solid ${t.border}`,
            borderRadius: '8px', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.textSecondary, fontSize: '16px', position: 'relative',
            cursor: 'pointer', transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.textPrimary; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textSecondary; }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              background: t.danger, color: 'white',
              borderRadius: '10px', fontSize: '9px', fontWeight: 700,
              minWidth: '16px', height: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px', border: `2px solid ${t.bg}`
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{
            background: 'transparent', border: `1px solid ${t.border}`,
            borderRadius: '8px', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.textSecondary, fontSize: '16px', cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.textPrimary; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textSecondary; }}
        >
          {mode === 'dark' ? '☀️' : '🌙'}
        </button>

        {!isMobile && (
          <button
            onClick={onSettingsClick}
            style={{
              background: 'transparent', border: `1px solid ${t.border}`,
              borderRadius: '8px', width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.textSecondary, fontSize: '16px', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textSecondary; }}
          >
            ⚙️
          </button>
        )}

        {/* Avatar */}
        <div
          onClick={onProfileClick}
          style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            border: `2px solid ${t.border}`, transition: 'border-color 0.15s',
            flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
        >
          {user?.email?.[0]?.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
