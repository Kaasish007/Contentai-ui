import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const features = [
  {
    step: '01', icon: '✍️', title: 'Describe Your Content',
    desc: 'Tell ContentAI what you want to create — a LinkedIn post, Twitter thread, YouTube script, or blog article.',
    color: '#6366f1'
  },
  {
    step: '02', icon: '🎯', title: 'Choose Platform & Tone',
    desc: 'Select your target platform and audience tone. ContentAI adapts its style to match each platform perfectly.',
    color: '#8b5cf6'
  },
  {
    step: '03', icon: '🤖', title: 'AI Generates Content',
    desc: "Powered by Groq's llama-3.3-70b model, ContentAI generates high-quality content in under 3 seconds.",
    color: '#a78bfa'
  },
  {
    step: '04', icon: '🚀', title: 'Publish to The Canvas',
    desc: 'Share your content with the ContentAI community on The Canvas and earn stars from other creators.',
    color: '#c4b5fd'
  }
];

const testimonials = [
  {
    name: 'Arjun Sharma', role: 'LinkedIn Creator · 12K followers', avatar: 'A', color: '#6366f1', stars: 5,
    text: 'ContentAI transformed my LinkedIn strategy. I went from 2K to 12K followers in just 3 months. The AI understands my voice perfectly.'
  },
  {
    name: 'Priya Mehta', role: 'Twitter Influencer · 28K followers', avatar: 'P', color: '#1d9bf0', stars: 5,
    text: 'I generate entire Twitter threads in seconds. The quality is incredible — my engagement rate tripled after using ContentAI.'
  },
  {
    name: 'Rahul Kumar', role: 'Content Marketer at TechCorp', avatar: 'R', color: '#22c55e', stars: 5,
    text: 'Our team saves 20+ hours per week on content creation. ContentAI pays for itself in the first day. Absolutely essential tool.'
  }
];

const plans = [
  {
    name: 'Spark', icon: '✏️', price: 'Free', color: '#6366f1',
    features: ['5 generations per day', 'All platforms supported', 'The Canvas access', 'Community features', 'Basic analytics'],
    notIncluded: ['Unlimited generations', 'Priority support', 'Advanced analytics']
  },
  {
    name: 'Creator', icon: '🎨', price: '₹299', period: '/month', color: '#8b5cf6', popular: true,
    features: ['Unlimited generations', 'All platforms supported', 'The Canvas access', 'Community features', 'Priority support', 'Advanced analytics'],
    notIncluded: ['Custom AI training']
  },
  {
    name: 'Masterpiece', icon: '🌌', price: '₹999', period: '/month', color: '#a78bfa',
    features: ['Unlimited generations', 'All platforms supported', 'The Canvas access', 'Community features', 'Priority support', 'Advanced analytics', 'Custom AI training', 'API access'],
    notIncluded: []
  }
];

const stats = [
  { value: '50K+', label: 'Content Generated' },
  { value: '2K+', label: 'Active Creators' },
  { value: '3s', label: 'Avg Generation Time' },
  { value: '4.9★', label: 'User Rating' }
];

const platformToOutputType = {
  LinkedIn: 'linkedin', Twitter: 'twitter',
  Instagram: 'instagram', YouTube: 'blog', Blog: 'blog'
};

export default function Explore({ onClose, onGetStarted }) {
  const { t } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [demoTopic, setDemoTopic] = useState('');
  const [demoPlatform, setDemoPlatform] = useState('LinkedIn');
  const [demoResult, setDemoResult] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionsRef = useRef({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % features.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    Object.values(sectionsRef.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const setRef = (id) => (el) => { sectionsRef.current[id] = el; };

  const handleDemo = async () => {
    if (!demoTopic.trim()) return;
    setDemoLoading(true);
    setDemoResult('');
    try {
      const outputType = platformToOutputType[demoPlatform] || 'linkedin';
      const res = await fetch(`${BACKEND}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: demoTopic,
          outputType,
          platform: demoPlatform,
          audience: 'Professional',
          isDemo: true
        })
      });
      const data = await res.json();
      setDemoResult(
        data.outputs?.[outputType] ||
        data.outputs?.linkedin ||
        data.content ||
        (data.error ? `❌ ${data.error}` : null) ||
        '⚠️ Could not generate. Make sure backend is running!'
      );
    } catch {
      setDemoResult('⚠️ Backend not running. Start the server with: npm run dev');
    }
    setDemoLoading(false);
  };

  const sectionStyle = (id) => ({
    opacity: visibleSections[id] ? 1 : 0,
    transform: visibleSections[id] ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease'
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: t.bg, overflowY: 'auto' }}>
      <button onClick={onClose} style={{
        position: 'fixed', top: '16px', right: '16px', zIndex: 2001,
        background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: '10px', padding: '8px 16px',
        color: t.textSecondary, cursor: 'pointer', fontSize: '13px',
        fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        ✕ Close
      </button>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* HERO */}
        <div style={{
          textAlign: 'center', padding: '100px 20px 80px',
          background: `radial-gradient(ellipse at 50% 0%, ${t.accent}15 0%, transparent 70%)`
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: `${t.accent}22`, border: `1px solid ${t.accent}44`,
            borderRadius: '20px', padding: '6px 16px', marginBottom: '24px'
          }}>
            <span style={{ fontSize: '12px' }}>✨</span>
            <span style={{ color: t.accent, fontSize: '12px', fontWeight: 600 }}>AI-Powered Content Creation</span>
          </div>

          <h1 style={{
            color: t.textPrimary, fontSize: '56px', fontWeight: 800,
            lineHeight: 1.1, margin: '0 0 20px',
            background: `linear-gradient(135deg, ${t.textPrimary}, ${t.accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Create Viral Content<br />in Seconds
          </h1>

          <p style={{ color: t.textSecondary, fontSize: '18px', lineHeight: '1.7', margin: '0 auto 40px', maxWidth: '540px' }}>
            ContentAI uses advanced AI to generate platform-perfect content for LinkedIn, Twitter, Instagram, YouTube, and more.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onGetStarted} style={{
              padding: '14px 32px', background: t.accent, color: 'white',
              border: 'none', borderRadius: '10px', fontSize: '15px',
              fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 24px ${t.accent}44`
            }}>
              🚀 Get Started Free
            </button>
            <button
              onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '14px 32px', background: 'transparent', color: t.textPrimary,
                border: `1px solid ${t.border}`, borderRadius: '10px', fontSize: '15px',
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              Try Live Demo ↓
            </button>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px', maxWidth: '700px', margin: '64px auto 0'
          }}>
            {stats.map(stat => (
              <div key={stat.label} style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: '12px', padding: '20px 12px', textAlign: 'center'
              }}>
                <p style={{ color: t.accent, fontWeight: 800, fontSize: '24px', margin: '0 0 4px' }}>{stat.value}</p>
                <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div id="features-section" ref={setRef('features-section')}
          style={{ ...sectionStyle('features-section'), padding: '60px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ color: t.textPrimary, fontSize: '36px', fontWeight: 700, margin: '0 0 12px' }}>How It Works</h2>
            <p style={{ color: t.textSecondary, fontSize: '16px', margin: 0 }}>Four simple steps to create amazing content</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {features.map((f, i) => (
              <div key={i} onClick={() => setActiveStep(i)} style={{
                background: t.bgCard,
                border: `1px solid ${activeStep === i ? f.color : t.border}`,
                borderRadius: '14px', padding: '24px', cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: activeStep === i ? `0 0 20px ${f.color}33` : t.shadowCard,
                transform: activeStep === i ? 'scale(1.02)' : 'scale(1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '28px', width: '48px', height: '48px',
                    background: `${f.color}22`, borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{f.icon}</span>
                  <div>
                    <span style={{ color: f.color, fontSize: '11px', fontWeight: 700 }}>STEP {f.step}</span>
                    <p style={{ color: t.textPrimary, fontWeight: 700, fontSize: '16px', margin: 0 }}>{f.title}</p>
                  </div>
                </div>
                <p style={{ color: t.textSecondary, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE AI DEMO */}
        <div id="demo-section" ref={setRef('demo-section')} style={{
          ...sectionStyle('demo-section'),
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '20px', padding: '48px', margin: '20px 0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ color: t.textPrimary, fontSize: '36px', fontWeight: 700, margin: '0 0 12px' }}>🤖 Try It Live</h2>
            <p style={{ color: t.textSecondary, fontSize: '16px', margin: 0 }}>Generate real AI content right here — no signup needed</p>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                value={demoTopic}
                onChange={e => setDemoTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDemo()}
                placeholder="Enter any topic... e.g. 'AI in healthcare'"
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '10px',
                  border: `1px solid ${t.border}`, background: t.bgSecondary,
                  color: t.textPrimary, fontSize: '14px', outline: 'none'
                }}
              />
              <select
                value={demoPlatform}
                onChange={e => setDemoPlatform(e.target.value)}
                style={{
                  padding: '12px', borderRadius: '10px',
                  border: `1px solid ${t.border}`, background: t.bgSecondary,
                  color: t.textPrimary, fontSize: '14px', outline: 'none', cursor: 'pointer'
                }}
              >
                {['LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'Blog'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDemo}
              disabled={demoLoading || !demoTopic.trim()}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px',
                background: demoLoading || !demoTopic.trim() ? `${t.accent}66` : t.accent,
                color: 'white', border: 'none', fontSize: '14px', fontWeight: 700,
                cursor: demoLoading || !demoTopic.trim() ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {demoLoading ? '⚡ Generating...' : '⚡ Generate Content'}
            </button>

            {demoResult && (
              <div style={{
                background: t.bgSecondary, border: `1px solid ${t.accent}44`,
                borderRadius: '12px', padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    background: `${t.accent}22`, color: t.accent,
                    fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px'
                  }}>
                    {demoPlatform} Content
                  </span>
                  <button onClick={() => navigator.clipboard.writeText(demoResult)} style={{
                    background: 'none', border: 'none', color: t.accent,
                    fontSize: '12px', cursor: 'pointer', fontWeight: 600
                  }}>
                    📋 Copy
                  </button>
                </div>
                <p style={{ color: t.textPrimary, fontSize: '14px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {demoResult}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div id="testimonials-section" ref={setRef('testimonials-section')}
          style={{ ...sectionStyle('testimonials-section'), padding: '60px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ color: t.textPrimary, fontSize: '36px', fontWeight: 700, margin: '0 0 12px' }}>Loved by Creators</h2>
            <p style={{ color: t.textSecondary, fontSize: '16px', margin: 0 }}>Join thousands of creators already using ContentAI</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {testimonials.map((t2, i) => (
              <div key={i} style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: '14px', padding: '24px', boxShadow: t.shadowCard
              }}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  {[...Array(t2.stars)].map((_, j) => (
                    <span key={j} style={{ color: '#fbbf24', fontSize: '14px' }}>★</span>
                  ))}
                </div>
                <p style={{ color: t.textPrimary, fontSize: '14px', lineHeight: '1.7', margin: '0 0 20px', fontStyle: 'italic' }}>
                  "{t2.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: `${t2.color}33`, border: `2px solid ${t2.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: t2.color, fontWeight: 700, fontSize: '15px'
                  }}>
                    {t2.avatar}
                  </div>
                  <div>
                    <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '13px', margin: 0 }}>{t2.name}</p>
                    <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>{t2.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRICING */}
        <div id="pricing-section" ref={setRef('pricing-section')}
          style={{ ...sectionStyle('pricing-section'), padding: '60px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ color: t.textPrimary, fontSize: '36px', fontWeight: 700, margin: '0 0 12px' }}>Simple Pricing</h2>
            <p style={{ color: t.textSecondary, fontSize: '16px', margin: 0 }}>Start free, upgrade when you're ready</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {plans.map((plan, i) => (
              <div key={i} style={{
                background: t.bgCard,
                border: `1px solid ${plan.popular ? plan.color : t.border}`,
                borderRadius: '16px', padding: '28px',
                boxShadow: plan.popular ? `0 0 30px ${plan.color}33` : t.shadowCard,
                position: 'relative', transform: plan.popular ? 'scale(1.04)' : 'scale(1)'
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%',
                    transform: 'translateX(-50%)',
                    background: plan.color, color: 'white',
                    fontSize: '11px', fontWeight: 700, padding: '4px 16px', borderRadius: '20px'
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '28px' }}>{plan.icon}</span>
                  <p style={{ color: t.textPrimary, fontWeight: 700, fontSize: '18px', margin: '8px 0 4px' }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ color: plan.color, fontWeight: 800, fontSize: '32px' }}>{plan.price}</span>
                    {plan.period && <span style={{ color: t.textMuted, fontSize: '13px' }}>{plan.period}</span>}
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#22c55e', fontSize: '13px' }}>✓</span>
                      <span style={{ color: t.textPrimary, fontSize: '13px' }}>{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ color: t.textMuted, fontSize: '13px' }}>✗</span>
                      <span style={{ color: t.textMuted, fontSize: '13px' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={onGetStarted} style={{
                  width: '100%', padding: '11px', borderRadius: '10px',
                  background: plan.popular ? plan.color : 'transparent',
                  color: plan.popular ? 'white' : t.textPrimary,
                  border: `1px solid ${plan.popular ? plan.color : t.border}`,
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                }}>
                  {plan.price === 'Free' ? 'Get Started Free' : `Start ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CTA */}
        <div id="cta-section" ref={setRef('cta-section')} style={{
          ...sectionStyle('cta-section'),
          textAlign: 'center', padding: '80px 40px',
          background: `linear-gradient(135deg, ${t.accent}22, #8b5cf622)`,
          borderRadius: '24px', border: `1px solid ${t.accent}33`
        }}>
          <h2 style={{ color: t.textPrimary, fontSize: '40px', fontWeight: 800, margin: '0 0 16px' }}>
            Ready to Create?
          </h2>
          <p style={{ color: t.textSecondary, fontSize: '16px', margin: '0 0 32px' }}>
            Join 2,000+ creators already using ContentAI to grow their audience
          </p>
          <button onClick={onGetStarted} style={{
            padding: '16px 40px', background: t.accent, color: 'white',
            border: 'none', borderRadius: '12px', fontSize: '16px',
            fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 32px ${t.accent}55`
          }}>
            🚀 Start Creating for Free
          </button>
        </div>

      </div>
    </div>
  );
}