import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/stars/daily-login`, {}, {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/stars/balance`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          setStarBalance(data.balance);
        } catch (err) {
          console.log('Stars error:', err.message);
        }
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
        <p style={{ color: t.textSecondary, fontSize: '14px' }}>Loading...</p>
      </div>
    </div>
  );

  if (!user) return <Login onLogin={setUser} />;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard user={user} onNavigate={setActivePage} />;
      case 'generate': return <Generate user={user} onUpgrade={() => setShowPricing(true)} />;
      case 'canvas': return <Canvas />;
      case 'leaderboard': return <Leaderboard user={user} />;
      case 'projects': return <Projects onNavigate={setActivePage} />;
      case 'settings': return <Settings user={user} />;
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
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        starBalance={starBalance}
        onStarsClick={() => setShowStars(true)}
        user={user}
      />
      <Navbar
        user={user}
        onProfileClick={() => setShowProfile(true)}
        onDMClick={() => setShowDMs(true)}
        onPricingClick={() => setShowPricing(true)}
/>
      <div style={{ marginLeft: '240px', marginTop: '56px', padding: '32px', minHeight: 'calc(100vh - 56px)' }}>
        {renderPage()}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
      {showStars && <StarsModal user={user} onClose={() => setShowStars(false)} />}
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      {showDMs && <DMsModal user={user} onClose={() => setShowDMs(false)} />}
      </div>
    </div>
  );
}

export default App;