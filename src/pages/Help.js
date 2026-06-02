import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const faqs = [
  { q: 'How do I generate content?', a: 'Go to Generate Content, select your platform, type your topic, and click Generate. AI will create tailored content for you!' },
  { q: 'How do I earn stars?', a: 'You earn 1 star for daily login, 2 stars for publishing to The Canvas, and bonus stars when your posts reach like milestones.' },
  { q: 'What is The Canvas?', a: 'The Canvas is our community feed where you can share AI-generated or manually written content, like and comment on others posts.' },
  { q: 'How do I upgrade my plan?', a: 'Click Pricing in the top navbar or click Upgrade Now in the dashboard to see our Creator and Masterpiece plans.' },
  { q: 'What is the daily generation limit?', a: 'Free Spark plan users get 5 AI generations per day. Upgrade to Creator for unlimited generations.' },
  { q: 'How does the Leaderboard work?', a: 'The leaderboard ranks users by stars earned. There are 4 views: Creator Leagues, Rising Stars, Category Kings, and Wall of Fame.' },
];

export default function Help() {
  const { t } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>Help Center</h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
          Find answers and get support
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

        {/* FAQs */}
        <div>
          <h2 style={{ color: t.textPrimary, fontSize: '18px', fontWeight: 600, margin: '0 0 16px' }}>
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '10px', marginBottom: '8px', overflow: 'hidden',
              transition: 'border-color 0.15s'
            }}>
              <div
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <p style={{ color: t.textPrimary, fontSize: '14px', fontWeight: 500, margin: 0 }}>{faq.q}</p>
                <span style={{ color: t.textMuted, fontSize: '16px', transition: 'transform 0.2s',
                  transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${t.border}` }}>
                  <p style={{ color: t.textSecondary, fontSize: '13px', margin: '12px 0 0', lineHeight: '1.6' }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact + Quick Links */}
        <div>
          {/* Contact */}
          <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '20px', marginBottom: '16px'
          }}>
            <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 12px' }}>
              Contact Support
            </h3>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your issue..."
              style={{
                width: '100%', height: '100px', background: t.bgSecondary,
                border: `1px solid ${t.border}`, borderRadius: '8px',
                padding: '10px', color: t.textPrimary, fontSize: '13px',
                resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '10px'
              }}
            />
            <button
              onClick={() => { setSent(true); setMessage(''); setTimeout(() => setSent(false), 3000); }}
              style={{
                width: '100%', padding: '9px',
                background: sent ? t.success : t.accent,
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {sent ? '✅ Message Sent!' : 'Send Message'}
            </button>
          </div>

          {/* Quick Links */}
          <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '20px'
          }}>
            <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 12px' }}>
              Quick Links
            </h3>
            {[
              { label: '📖 Documentation', desc: 'Read our full docs' },
              { label: '🎬 Video Tutorials', desc: 'Watch how-to videos' },
              { label: '💬 Community Forum', desc: 'Ask the community' },
              { label: '🐛 Report a Bug', desc: 'Help us improve' },
            ].map(link => (
              <div key={link.label} style={{
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                marginBottom: '6px', transition: 'background 0.15s',
                border: `1px solid ${t.border}`
              }}
                onMouseEnter={e => e.currentTarget.style.background = t.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <p style={{ color: t.textPrimary, fontSize: '13px', fontWeight: 500, margin: '0 0 2px' }}>{link.label}</p>
                <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>{link.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}