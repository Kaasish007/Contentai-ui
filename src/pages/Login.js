import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { loginUser, signupUser, supabase } from '../utils/supabase';
import bgImage from '../bg.png';
import logoImage from '../logo.png';

export default function Login({ onLogin, onBack }) {
  const { t, mode, toggleTheme } = useTheme();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) return setError('Please fill in all fields');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      if (isSignup) {
        await signupUser(email, password);
        setError('✅ Account created! You can now sign in.');
        setIsSignup(false);
      } else {
        const data = await loginUser(email, password);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />

      {/* Top left — Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 10,
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: '6px',
          color: 'rgba(255,255,255,0.7)', fontSize: '13px',
          fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Top right — Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute', top: '20px', right: '20px', zIndex: 10,
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '16px', cursor: 'pointer'
        }}
      >
        {mode === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src={logoImage}
            alt="Creaze Logo"
            style={{
              width: '80px', height: '80px',
              objectFit: 'contain', marginBottom: '16px',
              filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))'
            }}
          />
          <h1 style={{
            color: 'white', fontSize: '26px', fontWeight: 700,
            margin: '0 0 4px', letterSpacing: '0.5px',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            CREAZE
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', letterSpacing: '2px', margin: 0 }}>
            INTELLIGENT CREATION
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(10,10,20,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{
            color: 'white', fontSize: '18px', fontWeight: 600,
            margin: '0 0 4px', textAlign: 'center'
          }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.4)', fontSize: '13px',
            textAlign: 'center', margin: '0 0 24px'
          }}>
            {isSignup ? 'Join Creaze today' : 'Sign in to your account'}
          </p>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
              background: error.includes('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: error.includes('✅') ? '#4ade80' : '#f87171',
              fontSize: '13px',
              border: `1px solid ${error.includes('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
            }}>
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{
              width: '100%', padding: '11px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px', color: 'white',
              fontSize: '14px', fontWeight: 500,
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', marginBottom: '16px', transition: 'background 0.15s'
            }}
            onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { if (!googleLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
          >
            {googleLoading ? 'Redirecting...' : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              color: 'rgba(255,255,255,0.6)', fontSize: '12px',
              fontWeight: 500, display: 'block', marginBottom: '6px'
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: 'white', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(79,110,247,0.8)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              color: 'rgba(255,255,255,0.6)', fontSize: '12px',
              fontWeight: 500, display: 'block', marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 40px 10px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: 'white', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(79,110,247,0.8)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {/* Minimalist eye icon */}
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'rgba(255,255,255,0.35)',
                  padding: '4px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  // Eye-off (hidden)
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // Eye (visible)
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'rgba(79,110,247,0.5)' : 'rgba(79,110,247,0.9)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s', backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#4f6ef7'; }}
            onMouseLeave={e => { if (!loading) e.target.style.background = 'rgba(79,110,247,0.9)'; }}
          >
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        <p style={{
          textAlign: 'center', color: 'rgba(255,255,255,0.5)',
          fontSize: '13px', marginTop: '16px'
        }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{ color: '#4f6ef7', cursor: 'pointer', marginLeft: '6px', fontWeight: 500 }}
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}
