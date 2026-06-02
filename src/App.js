import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase, logoutUser } from './utils/supabase';
import { useTheme } from './context/ThemeContext';
import PricingModal from './components/PricingModal';
import DMsModal from './components/DMsModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Canvas from './pages/Canvas';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Leaderboard from './pages/Leaderboard';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import ProfileModal from './components/ProfileModal';
import StarsModal from './components/StarsModal';
import Help from './pages/Help';
import NotificationsModal from './components/NotificationsModal';
import Analytics from './pages/Analytics';
import Explore from './pages/Explore';
import AboutUs from './pages/AboutUs';

function App() {
  const { t } = useTheme();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [starBalance, setStarBalance] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showDMs, setShowDMs] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStarBalance = useCallback(async (token) => {
    try {
      let accessToken = token;
      if (!accessToken) {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token;
      }
      if (!accessToken) return;
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/stars/balance`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStarBalance(data.balance);
    } catch (err) {
      console.log('Balance fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        setShowLanding(false);
        upsertProfile(session.user);
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/stars/daily-login`, {}, {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          await fetchStarBalance(session.access_token);
        } catch (err) {
          console.log('Stars error:', err.message);
        }
      }
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowLanding(false);
        await upsertProfile(session.user);
      }
    });
  }, [fetchStarBalance]);

  const upsertProfile = async (u) => {
    supabase.from('profiles').upsert({
      user_id: u.id,
      email: u.email,
    }, { onConflict: 'user_id' }).then(({ error }) => {
      if (error) console.log('Profile upsert error:', error.message);
    });
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setShowLanding(true);
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    if (isMobile) setSidebarOpen(false);
  };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
        <p style={{ color: t.textSecondary, fontSize: '14px' }}>Loading...</p>
      </div>
    </div>
  );

  if (!user && showLanding) return (
    <div style={{ position: 'relative' }}>
      <AboutUs
        onGetStarted={() => setShowLanding(false)}
        onPricing={() => setShowPricing(true)}
      />
      {showPricing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <PricingModal onClose={() => setShowPricing(false)} />
        </div>
      )}
    </div>
  );

  if (!user) return (
    <div style={{ position: 'relative' }}>
      <Login onLogin={setUser} onBack={() => setShowLanding(true)} />
      {showPricing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <PricingModal onClose={() => setShowPricing(false)} />
        </div>
      )}
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'generate': return <Generate user={user} onUpgrade={() => setShowPricing(true)} />;
      case 'canvas': return <Canvas user={user} onStarGifted={fetchStarBalance} />;
      case 'leaderboard': return <Leaderboard user={user} />;
      case 'projects': return <Projects onNavigate={handleNavigate} user={user} />;
      case 'settings': return <Settings user={user} />;
      case 'help': return <Help />;
      case 'analytics': return <Analytics user={user} onNavigate={handleNavigate} />;
      case 'about': return <AboutUs onGetStarted={() => {}} onPricing={() => setShowPricing(true)} />;
      default: return (
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</p>
          <p style={{ color: t.textSecondary, fontSize: '16px' }}>Coming soon!</p>
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.textPrimary }}>

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.25s ease',
        zIndex: 100
      }}>
        <Sidebar
          activePage={activePage}
          setActivePage={handleNavigate}
          starBalance={starBalance}
          onStarsClick={() => { setShowStars(true); if (isMobile) setSidebarOpen(false); }}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      <Navbar
        user={user}
        onProfileClick={() => setShowProfile(true)}
        onDMClick={() => setShowDMs(true)}
        onPricingClick={() => setShowPricing(true)}
        onSettingsClick={() => handleNavigate('settings')}
        onNotificationsClick={() => setShowNotifications(!showNotifications)}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        onExploreClick={() => setShowExplore(true)}
      />

      <div style={{
        marginLeft: isMobile ? '0' : '240px',
        marginTop: '56px',
        padding: isMobile ? '16px' : '32px',
        minHeight: 'calc(100vh - 56px)'
      }}>
        <div key={activePage} className="page-enter">
          {renderPage()}
        </div>
        {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
        {showStars && <StarsModal user={user} onClose={() => setShowStars(false)} />}
        {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
        {showDMs && <DMsModal user={user} onClose={() => setShowDMs(false)} />}
        {showNotifications && (
          <NotificationsModal
            user={user}
            onClose={() => setShowNotifications(false)}
          />
        )}
        {showExplore && (
          <Explore
            onClose={() => setShowExplore(false)}
            onGetStarted={() => setShowExplore(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;