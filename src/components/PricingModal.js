import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { supabase } from '../utils/supabase';

const plans = [
  {
    id: 'spark', name: 'Spark', icon: '✏️', price: 0, period: 'forever',
    color: '#94a3b8', current: true,
    features: ['5 AI generations per day', 'Access to The Canvas', 'Basic profile', 'Daily login stars']
  },
  {
    id: 'creator', name: 'Creator', icon: '🎨', price: 299, period: 'month',
    color: '#4f6ef7', current: false, popular: true,
    features: ['Unlimited AI generations', 'All platform templates', 'Audience type selector', 'Priority support', 'Earn 2x stars']
  },
  {
    id: 'masterpiece', name: 'Masterpiece', icon: '🌌', price: 999, period: 'month',
    color: '#8b5cf6', current: false,
    features: ['Everything in Creator', 'Analytics dashboard', 'Team accounts', 'Custom branding', 'Earn 3x stars', 'Early access to features']
  }
];

export default function PricingModal({ onClose }) {
  const { t } = useTheme();
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (planId) => {
    if (planId === 'spark') return;
    setLoading(planId);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/stripe/checkout`,
        { plan: planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = data.url;
    } catch (err) {
      alert('Error creating checkout session');
    }
    setLoading(null);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: t.bgCard, borderRadius: '16px', width: '860px',
        border: `1px solid ${t.border}`, padding: '36px',
        boxShadow: t.shadowLg, maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
          <button onClick={onClose} style={{
            position: 'absolute', right: 0, top: 0,
            background: t.bgTertiary, border: `1px solid ${t.border}`,
            borderRadius: '6px', width: '28px', height: '28px',
            color: t.textSecondary, cursor: 'pointer', fontSize: '14px'
          }}>×</button>
          <h2 style={{ color: t.textPrimary, fontSize: '28px', fontWeight: 700, margin: '0 0 8px' }}>
            Choose Your Plan
          </h2>
          <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
            Start free, upgrade when you're ready 🚀
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              background: t.bgSecondary, borderRadius: '14px', padding: '24px',
              border: `2px solid ${plan.popular ? plan.color : t.border}`,
              position: 'relative', transition: 'all 0.2s'
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.color, color: 'white',
                  padding: '3px 14px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: 700
                }}>MOST POPULAR</div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '28px', margin: '0 0 8px' }}>{plan.icon}</p>
                <h3 style={{ color: plan.color, fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>{plan.name}</h3>
                <div>
                  <span style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700 }}>
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ color: t.textSecondary, fontSize: '13px' }}>/{plan.period}</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                {plan.features.map(feature => (
                  <div key={feature} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 0', borderBottom: `1px solid ${t.border}`
                  }}>
                    <span style={{ color: t.success, fontSize: '12px' }}>✓</span>
                    <span style={{ color: t.textSecondary, fontSize: '13px' }}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id || plan.current}
                style={{
                  width: '100%', padding: '11px',
                  background: plan.current ? t.bgTertiary : plan.color,
                  color: plan.current ? t.textMuted : 'white',
                  border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 600,
                  cursor: plan.current ? 'default' : 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {loading === plan.id ? '⏳ Loading...' :
                  plan.current ? '✅ Current Plan' :
                  `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: t.textMuted, fontSize: '12px', marginTop: '20px' }}>
          🔒 Secure payment powered by Stripe • Cancel anytime
        </p>
      </div>
    </div>
  );
}