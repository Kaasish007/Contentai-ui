import { useEffect, useRef, useState } from "react";

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const features = [
  { step: '01', icon: '✍️', title: 'Describe Your Content', desc: 'Tell Creaze what you want to create — a LinkedIn post, Twitter thread, YouTube script, or blog article.', color: '#6366f1' },
  { step: '02', icon: '🎯', title: 'Choose Platform & Tone', desc: 'Select your target platform and audience tone. Creaze adapts its style to match each platform perfectly.', color: '#8b5cf6' },
  { step: '03', icon: '🤖', title: 'AI Generates Content', desc: "Powered by Groq's llama-3.3-70b model, Creaze generates high-quality content in under 3 seconds.", color: '#a78bfa' },
  { step: '04', icon: '🚀', title: 'Publish to The Canvas', desc: 'Share your content with the Creaze community on The Canvas and earn stars from other creators.', color: '#c4b5fd' },
];

const testimonials = [
  { name: 'Arjun Sharma', role: 'LinkedIn Creator · 12K followers', avatar: 'A', color: '#6366f1', stars: 5, text: 'Creaze transformed my LinkedIn strategy. I went from 2K to 12K followers in just 3 months. The AI understands my voice perfectly.' },
  { name: 'Priya Mehta', role: 'Twitter Influencer · 28K followers', avatar: 'P', color: '#1d9bf0', stars: 5, text: 'I generate entire Twitter threads in seconds. The quality is incredible — my engagement rate tripled after using Creaze.' },
  { name: 'Rahul Kumar', role: 'Content Marketer at TechCorp', avatar: 'R', color: '#22c55e', stars: 5, text: 'Our team saves 20+ hours per week on content creation. Creaze pays for itself in the first day. Absolutely essential tool.' },
];

const plans = [
  { name: 'Spark', icon: '✏️', price: 'Free', color: '#6366f1', features: ['5 generations per day', 'All platforms supported', 'The Canvas access', 'Community features', 'Basic analytics'], notIncluded: ['Unlimited generations', 'Priority support', 'Advanced analytics'] },
  { name: 'Creator', icon: '🎨', price: '₹299', period: '/month', color: '#8b5cf6', popular: true, features: ['Unlimited generations', 'All platforms supported', 'The Canvas access', 'Community features', 'Priority support', 'Advanced analytics'], notIncluded: ['Custom AI training'] },
  { name: 'Masterpiece', icon: '🌌', price: '₹999', period: '/month', color: '#a78bfa', features: ['Unlimited generations', 'All platforms supported', 'The Canvas access', 'Community features', 'Priority support', 'Advanced analytics', 'Custom AI training', 'API access'], notIncluded: [] },
];

const platformToOutputType = {
  LinkedIn: 'linkedin', Twitter: 'twitter',
  Instagram: 'instagram', YouTube: 'blog', Blog: 'blog'
};

const AboutUs = ({ onGetStarted = () => {}, onPricing = () => {} }) => {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [demoTopic, setDemoTopic] = useState('');
  const [demoPlatform, setDemoPlatform] = useState('LinkedIn');
  const [demoResult, setDemoResult] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(prev => (prev + 1) % features.length), 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
      }),
      { threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  const setRef = (id) => (el) => { sectionRefs.current[id] = el; };
  const isVisible = (id) => visibleSections[id];

  const handleDemo = async () => {
    if (!demoTopic.trim()) return;
    setDemoLoading(true);
    setDemoResult('');
    try {
      const outputType = platformToOutputType[demoPlatform] || 'linkedin';
      const res = await fetch(`${BACKEND}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: demoTopic, outputType, platform: demoPlatform, audience: 'Professional', isDemo: true })
      });
      const data = await res.json();
      setDemoResult(data.outputs?.[outputType] || data.outputs?.linkedin || data.content || (data.error ? `❌ ${data.error}` : null) || '⚠️ Could not generate. Make sure backend is running!');
    } catch {
      setDemoResult('⚠️ Backend not running. Start the server with: npm run dev');
    }
    setDemoLoading(false);
  };

  const fadeIn = (id, delay = 0) => ({
    opacity: isVisible(id) ? 1 : 0,
    transform: isVisible(id) ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
  });

  return (
    <div style={styles.root}>
      <div style={styles.noiseOverlay} />
      <div style={{ ...styles.orb, ...styles.orb1, opacity: Math.max(0, 1 - scrollY / 600) }} />
      <div style={{ ...styles.orb, ...styles.orb2, opacity: Math.max(0, 1 - scrollY / 800) }} />
      <div style={{ ...styles.orb, ...styles.orb3 }} />

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>✦</span>
          <span style={styles.navLogoText}>Creaze</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span
            onClick={() => document.getElementById('pricing-section').scrollIntoView({ behavior: 'smooth' })}
            style={{ ...styles.navLink, cursor: 'pointer' }}
          >
            Pricing
          </span>
          <span onClick={onGetStarted} style={{ ...styles.navCta, cursor: 'pointer' }}>Get Started →</span>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>
          <span style={styles.heroBadgeDot} />
          Our Story
        </div>
        <h1 style={styles.heroTitle}>
          We were confused.<br />
          <span style={styles.heroTitleAccent}>So we built this.</span>
        </h1>
        <p style={styles.heroSub}>
          Creaze started from a real problem — not a boardroom. We tried to solve a real world problem,
          staring at their phones, wondering what to post next. Sound familiar?
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span onClick={onGetStarted} style={{ ...styles.ctaPrimary, cursor: 'pointer' }}>Start for Free</span>
          <span
            onClick={() => document.getElementById('pricing-section').scrollIntoView({ behavior: 'smooth' })}
            style={{ ...styles.ctaSecondary, cursor: 'pointer' }}
          >
            See Pricing ↓
          </span>
        </div>
        <div style={styles.heroScroll}>
          <div style={styles.heroScrollLine} />
          <span style={styles.heroScrollText}>scroll</span>
        </div>
      </section>

      {/* STORY */}
      <section id="story" ref={setRef("story")} style={{ ...styles.section, ...styles.storySection, ...fadeIn("story") }}>
        <div style={styles.storyGrid}>
          <div style={styles.storyLeft}>
            <div style={styles.storyTag}>The Origin</div>
            <h2 style={styles.storyTitle}>It started with a group chat.</h2>
          </div>
          <div style={styles.storyRight}>
            <div style={styles.storyCard}>
              <div style={styles.storyCardIcon}>💬</div>
              <p style={styles.storyCardText}>"Guys what should I post today?"</p>
              <p style={styles.storyCardSub}>— every group chat, every day</p>
            </div>
            <p style={styles.storyPara}>Me and my friends kept hitting the same wall. We had ideas, we had things to say — but turning that into actual content for Instagram, LinkedIn, Twitter? That part was painful. We'd spend more time on the caption than on the actual thought.</p>
            <p style={styles.storyPara}>No fancy startup origin. No investors. Just me and my teammate who got annoyed enough to build something. Creaze was born from that exact frustration — and every feature exists because we needed it ourselves.</p>
            <div style={styles.storyHighlight}>
              <span style={styles.storyHighlightText}>"Built by creators who were stuck, for creators who are stuck."</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" ref={setRef("how")} style={{ ...styles.section, ...fadeIn("how") }}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTag}>How It Works</div>
          <h2 style={styles.sectionTitle}>Four simple steps.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} onClick={() => setActiveStep(i)} style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${activeStep === i ? f.color : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '14px', padding: '24px', cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeStep === i ? `0 0 20px ${f.color}33` : 'none',
              transform: activeStep === i ? 'scale(1.02)' : 'scale(1)',
              ...fadeIn("how", i * 0.1)
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px', width: '48px', height: '48px', background: `${f.color}22`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</span>
                <div>
                  <span style={{ color: f.color, fontSize: '11px', fontWeight: 700 }}>STEP {f.step}</span>
                  <p style={{ color: '#f1f0f5', fontWeight: 700, fontSize: '16px', margin: 0 }}>{f.title}</p>
                </div>
              </div>
              <p style={{ color: 'rgba(232,230,240,0.6)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO */}
      <section id="demo" ref={setRef("demo")} style={{ ...styles.section, ...fadeIn("demo") }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '48px' }}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTag}>Try It Live</div>
            <h2 style={styles.sectionTitle}>🤖 Generate real AI content — no signup needed</h2>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                value={demoTopic}
                onChange={e => setDemoTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDemo()}
                placeholder="Enter any topic... e.g. 'AI in healthcare'"
                style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f0f5', fontSize: '14px', outline: 'none' }}
              />
              <select value={demoPlatform} onChange={e => setDemoPlatform(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f0f5', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                {['LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'Blog'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={handleDemo} disabled={demoLoading || !demoTopic.trim()} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: demoLoading || !demoTopic.trim() ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', fontSize: '14px', fontWeight: 700, cursor: demoLoading || !demoTopic.trim() ? 'not-allowed' : 'pointer', marginBottom: '20px' }}>
              {demoLoading ? '⚡ Generating...' : '⚡ Generate Content'}
            </button>
            {demoResult && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>{demoPlatform} Content</span>
                  <button onClick={() => navigator.clipboard.writeText(demoResult)} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>📋 Copy</button>
                </div>
                <p style={{ color: '#f1f0f5', fontSize: '14px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>{demoResult}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" ref={setRef("testimonials")} style={{ ...styles.section, ...fadeIn("testimonials") }}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTag}>Loved by Creators</div>
          <h2 style={styles.sectionTitle}>Join thousands of creators.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {testimonials.map((tm, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', ...fadeIn("testimonials", i * 0.1) }}>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                {[...Array(tm.stars)].map((_, j) => <span key={j} style={{ color: '#fbbf24', fontSize: '14px' }}>★</span>)}
              </div>
              <p style={{ color: 'rgba(232,230,240,0.8)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 20px', fontStyle: 'italic' }}>"{tm.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `${tm.color}33`, border: `2px solid ${tm.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tm.color, fontWeight: 700, fontSize: '15px' }}>{tm.avatar}</div>
                <div>
                  <p style={{ color: '#f1f0f5', fontWeight: 600, fontSize: '13px', margin: 0 }}>{tm.name}</p>
                  <p style={{ color: 'rgba(232,230,240,0.4)', fontSize: '11px', margin: 0 }}>{tm.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing-section" ref={setRef("pricing-section")} style={{ ...styles.section, ...fadeIn("pricing-section") }}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTag}>Simple Pricing</div>
          <h2 style={styles.sectionTitle}>Start free, upgrade when ready.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {plans.map((plan, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${plan.popular ? plan.color : 'rgba(255,255,255,0.07)'}`, borderRadius: '16px', padding: '28px', position: 'relative', transform: plan.popular ? 'scale(1.04)' : 'scale(1)', boxShadow: plan.popular ? `0 0 30px ${plan.color}33` : 'none', ...fadeIn("pricing-section", i * 0.1) }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 16px', borderRadius: '20px' }}>MOST POPULAR</div>
              )}
              <span style={{ fontSize: '28px' }}>{plan.icon}</span>
              <p style={{ color: '#f1f0f5', fontWeight: 700, fontSize: '18px', margin: '8px 0 4px' }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                <span style={{ color: plan.color, fontWeight: 800, fontSize: '32px' }}>{plan.price}</span>
                {plan.period && <span style={{ color: 'rgba(232,230,240,0.4)', fontSize: '13px' }}>{plan.period}</span>}
              </div>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', fontSize: '13px' }}>✓</span>
                  <span style={{ color: '#f1f0f5', fontSize: '13px' }}>{f}</span>
                </div>
              ))}
              {plan.notIncluded.map((f, j) => (
                <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(232,230,240,0.3)', fontSize: '13px' }}>✗</span>
                  <span style={{ color: 'rgba(232,230,240,0.3)', fontSize: '13px' }}>{f}</span>
                </div>
              ))}
              <button onClick={onGetStarted} style={{ width: '100%', padding: '11px', borderRadius: '10px', background: plan.popular ? plan.color : 'transparent', color: plan.popular ? 'white' : '#f1f0f5', border: `1px solid ${plan.popular ? plan.color : 'rgba(255,255,255,0.1)'}`, fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '16px' }}>
                {plan.price === 'Free' ? 'Get Started Free' : `Start ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" ref={setRef("mission")} style={{ ...styles.section, ...styles.missionSection, ...fadeIn("mission") }}>
        <div style={styles.missionInner}>
          <div style={styles.missionLabel}>Our Mission</div>
          <h2 style={styles.missionTitle}>Every creator deserves a<br /><span style={styles.missionAccent}>voice that doesn't get stuck.</span></h2>
          <p style={styles.missionDesc}>We're not here to replace your creativity. We're here to unblock it. Creaze is the co-pilot that turns your raw thoughts into content that actually sounds like you — just faster.</p>
          <div style={styles.missionStats}>
            {[{ num: "5+", label: "Platforms Supported" }, { num: "₹299", label: "Unlimited Plan" }, { num: "∞", label: "Ideas Unlocked" }].map((stat) => (
              <div key={stat.label} style={styles.missionStat}>
                <div style={styles.missionStatNum}>{stat.num}</div>
                <div style={styles.missionStatLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" ref={setRef("team")} style={{ ...styles.section, ...fadeIn("team") }}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTag}>The People</div>
          <h2 style={styles.sectionTitle}>Who's behind this?</h2>
        </div>
        <div style={styles.teamGrid}>
          {[
            { name: "Kaasish", role: "Founder & Builder", emoji: "👑", desc: "Who got tired of staring at blank screens." },
            { name: "Nikitha", role: "Co-Founder & Idea Planner", emoji: "🤝", desc: "Who asked 'what do I even post?' — and sparked this entire idea." },
            { name: "You", role: "The Community", emoji: "🌟", desc: "Every creator who joins The Canvas makes Creaze what it is." },
          ].map((member, i) => (
            <div key={member.name} style={{ ...styles.teamCard, ...(i === 0 ? styles.teamCardFeatured : {}), ...fadeIn("team", i * 0.15) }}>
              <div style={styles.teamEmoji}>{member.emoji}</div>
              <h3 style={styles.teamName}>{member.name}</h3>
              <div style={styles.teamRole}>{member.role}</div>
              <p style={styles.teamDesc}>{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="cta" ref={setRef("cta")} style={{ ...styles.ctaSection, ...fadeIn("cta") }}>
        <div style={styles.ctaInner}>
          <div style={styles.ctaGlow} />
          <p style={styles.ctaEyebrow}>Ready to create?</p>
          <h2 style={styles.ctaTitle}>Stop staring.<br />Start creating.</h2>
          <p style={styles.ctaDesc}>Join creators who stopped struggling with blank screens. It's free to start — no credit card needed.</p>
          <div style={styles.ctaButtons}>
            <span onClick={onGetStarted} style={{ ...styles.ctaPrimary, cursor: 'pointer' }}>Start for Free</span>
          </div>
          <p style={styles.ctaNote}>✦ Free plan includes 5 generations/day</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          <span style={styles.navLogoIcon}>✦</span>
          <span style={styles.navLogoText}>Creaze</span>
        </div>
        <p style={styles.footerTagline}>Made with frustration & love in Madurai 🇮🇳</p>
        <div style={styles.footerLinks}>
          <span onClick={onGetStarted} style={{ ...styles.footerLink, cursor: 'pointer' }}>App</span>
          <a href="#" style={styles.footerLink}>Privacy</a>
          <a href="#" style={styles.footerLink}>Terms</a>
        </div>
        <p style={styles.footerCopy}>© 2025 Creaze. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  root: { minHeight: "100vh", backgroundColor: "#0a0a0f", color: "#e8e6f0", fontFamily: "'DM Sans', 'Outfit', sans-serif", position: "relative", overflowX: "hidden" },
  noiseOverlay: { position: "fixed", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, opacity: 0.4, pointerEvents: "none", zIndex: 0 },
  orb: { position: "fixed", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 },
  orb1: { width: 500, height: 500, background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)", top: -100, right: -100 },
  orb2: { width: 400, height: 400, background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)", top: 200, left: -150 },
  orb3: { width: 300, height: 300, background: "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)", bottom: 400, right: 100 },
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", backdropFilter: "blur(20px)", backgroundColor: "rgba(10, 10, 15, 0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  navLogoIcon: { fontSize: 22, color: "#a78bfa" },
  navLogoText: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "#f1f0f5" },
  navLink: { fontSize: 14, color: "rgba(232,230,240,0.6)", fontWeight: 500, padding: "8px 12px" },
  navCta: { padding: "9px 22px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, letterSpacing: "0.3px" },
  hero: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", zIndex: 1 },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 100, border: "1px solid rgba(167, 139, 250, 0.3)", backgroundColor: "rgba(167, 139, 250, 0.08)", fontSize: 13, color: "#a78bfa", fontWeight: 500, marginBottom: 32, letterSpacing: "0.5px" },
  heroBadgeDot: { width: 6, height: 6, borderRadius: "50%", backgroundColor: "#a78bfa" },
  heroTitle: { fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", color: "#f1f0f5", marginBottom: 24, maxWidth: 800 },
  heroTitleAccent: { background: "linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { fontSize: 18, color: "rgba(232, 230, 240, 0.6)", lineHeight: 1.7, maxWidth: 560, marginBottom: 40 },
  heroScroll: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "absolute", bottom: 40 },
  heroScrollLine: { width: 1, height: 48, background: "linear-gradient(to bottom, rgba(167,139,250,0.6), transparent)" },
  heroScrollText: { fontSize: 11, color: "rgba(232,230,240,0.3)", letterSpacing: "2px", textTransform: "uppercase" },
  section: { padding: "100px 48px", position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" },
  sectionHeader: { textAlign: "center", marginBottom: 60 },
  sectionTag: { display: "inline-block", fontSize: 12, color: "#a78bfa", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14 },
  sectionTitle: { fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1.5px", color: "#f1f0f5", lineHeight: 1.1 },
  storySection: { padding: "100px 48px" },
  storyGrid: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64, alignItems: "start" },
  storyLeft: { position: "sticky", top: 120 },
  storyTag: { fontSize: 12, color: "#a78bfa", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 },
  storyTitle: { fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-1px", color: "#f1f0f5", lineHeight: 1.15 },
  storyRight: { display: "flex", flexDirection: "column", gap: 24 },
  storyCard: { padding: "24px 28px", background: "rgba(167, 139, 250, 0.06)", border: "1px solid rgba(167, 139, 250, 0.15)", borderRadius: 16, display: "flex", flexDirection: "column", gap: 8 },
  storyCardIcon: { fontSize: 28 },
  storyCardText: { fontSize: 22, fontWeight: 700, color: "#f1f0f5", fontStyle: "italic", margin: 0 },
  storyCardSub: { fontSize: 13, color: "rgba(232,230,240,0.4)", margin: 0 },
  storyPara: { fontSize: 16, color: "rgba(232,230,240,0.7)", lineHeight: 1.8, margin: 0 },
  storyHighlight: { padding: "20px 24px", borderLeft: "3px solid #a78bfa", backgroundColor: "rgba(167, 139, 250, 0.05)", borderRadius: "0 12px 12px 0" },
  storyHighlightText: { fontSize: 17, color: "#c4b5fd", fontStyle: "italic", fontWeight: 500 },
  missionSection: { background: "linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(79, 70, 229, 0.04) 100%)", border: "1px solid rgba(167, 139, 250, 0.1)", borderRadius: 32, padding: "80px 64px", maxWidth: 1100, margin: "0 auto" },
  missionInner: { textAlign: "center", maxWidth: 700, margin: "0 auto" },
  missionLabel: { fontSize: 12, color: "#a78bfa", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20 },
  missionTitle: { fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 800, letterSpacing: "-1.5px", color: "#f1f0f5", lineHeight: 1.1, marginBottom: 20 },
  missionAccent: { background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  missionDesc: { fontSize: 17, color: "rgba(232,230,240,0.6)", lineHeight: 1.75, marginBottom: 48 },
  missionStats: { display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" },
  missionStat: { textAlign: "center" },
  missionStatNum: { fontSize: 40, fontWeight: 800, color: "#a78bfa", letterSpacing: "-1px", lineHeight: 1, marginBottom: 6 },
  missionStatLabel: { fontSize: 13, color: "rgba(232,230,240,0.4)", fontWeight: 500 },
  teamGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 },
  teamCard: { padding: "36px 28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, textAlign: "center" },
  teamCardFeatured: { background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.06))", border: "1px solid rgba(167, 139, 250, 0.25)" },
  teamEmoji: { fontSize: 48, marginBottom: 16 },
  teamName: { fontSize: 22, fontWeight: 800, color: "#f1f0f5", letterSpacing: "-0.5px", marginBottom: 6 },
  teamRole: { fontSize: 12, color: "#a78bfa", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14 },
  teamDesc: { fontSize: 14, color: "rgba(232,230,240,0.55)", lineHeight: 1.65, margin: 0 },
  ctaSection: { padding: "80px 48px", position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" },
  ctaInner: { textAlign: "center", background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 32, padding: "80px 48px", position: "relative", overflow: "hidden" },
  ctaGlow: { position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 400, height: 300, background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)", pointerEvents: "none" },
  ctaEyebrow: { fontSize: 13, color: "#a78bfa", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 },
  ctaTitle: { fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 800, letterSpacing: "-2px", color: "#f1f0f5", lineHeight: 1.08, marginBottom: 20 },
  ctaDesc: { fontSize: 16, color: "rgba(232,230,240,0.6)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 40px" },
  ctaButtons: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 },
  ctaPrimary: { padding: "14px 32px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 600, letterSpacing: "0.3px", boxShadow: "0 4px 24px rgba(124,58,237,0.35)" },
  ctaSecondary: { padding: "14px 32px", background: "rgba(255,255,255,0.05)", color: "rgba(232,230,240,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 15, fontWeight: 600 },
  ctaNote: { fontSize: 13, color: "rgba(232,230,240,0.35)", marginTop: 16 },
  footer: { textAlign: "center", padding: "48px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 },
  footerLogo: { display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 8 },
  footerTagline: { fontSize: 14, color: "rgba(232,230,240,0.35)", marginTop: 12, marginBottom: 20 },
  footerLinks: { display: "flex", justifyContent: "center", gap: 28, marginBottom: 16 },
  footerLink: { fontSize: 13, color: "rgba(232,230,240,0.4)", textDecoration: "none" },
  footerCopy: { fontSize: 12, color: "rgba(232,230,240,0.2)" },
};

export default AboutUs;