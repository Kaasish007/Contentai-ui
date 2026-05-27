import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { loginUser, signupUser } from '../utils/supabase';
import bgImage from '../bg.png';
import logoImage from '../logo.png';

export default function Login({ onLogin }) {
  const { t, mode, toggleTheme } = useTheme();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)'
      }} />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute', top: '20px', right: '20px', zIndex: 10,
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '16px', cursor: 'pointer'
        }}
      >
        {mode === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '400px', padding: '0 24px'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src={logoImage}
            alt="ContentAI Logo"
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
            CONTENT AI
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
            {isSignup ? 'Join ContentAI today' : 'Sign in to your account'}
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
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(79,110,247,0.8)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

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
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(79,110,247,0.8)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'rgba(255,255,255,0.4)',
                  fontSize: '14px', padding: '4px', cursor: 'pointer'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'rgba(79,110,247,0.5)' : 'rgba(79,110,247,0.9)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              backdropFilter: 'blur(10px)'
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