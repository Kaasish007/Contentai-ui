import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabase';

const platforms = [
  { id: 'twitter', label: 'Twitter', icon: '𝕏' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'instagram', label: 'Instagram', icon: '◎' },
  { id: 'youtube', label: 'YouTube', icon: '▶' },
  { id: 'blog', label: 'Blog', icon: '✍' },
];

const tones = ['Professional Tone', 'Creative', 'Concise'];
const audiences = ['Professional', 'Student', 'Creator', 'Business'];

export default function Generate({ user, onUpgrade }) {
  const { t } = useTheme();
  const [platform, setPlatform] = useState('twitter');
  const [text, setText] = useState('');
  const [tone, setTone] = useState('Professional Tone');
  const [audience, setAudience] = useState('Professional');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [limit, setLimit] = useState({ used: 0, limit: 5, remaining: 5, canGenerate: true });

  const platformToOutput = {
    twitter: 'twitter', linkedin: 'linkedin',
    instagram: 'instagram', youtube: 'newsletter', blog: 'blog'
  };

  useEffect(() => {
    checkLimit();
  }, []);

  const checkLimit = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/stars/check-limit`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLimit(data);
    } catch (err) {
      console.log('Limit check error:', err.message);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    if (!limit.canGenerate) return;
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/generate`,
        { rawText: text, platform, audience },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOutput(res.data.outputs[platformToOutput[platform]]);
      checkLimit();
    } catch (err) {
      setOutput('Error generating content. Please try again.');
    }
    setLoading(false);
  };

  const activePlatform = platforms.find(p => p.id === platform);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
            Generate Content
          </h1>
          <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
            Choose your content type and let AI create engaging posts for you
          </p>
        </div>

        {/* Usage Indicator */}
        <div style={{
          background: t.bgCard, border: `1px solid ${limit.remaining <= 1 ? t.danger + '44' : t.border}`,
          borderRadius: '10px', padding: '12px 16px', textAlign: 'right'
        }}>
          <p style={{ color: t.textSecondary, fontSize: '11px', margin: '0 0 4px' }}>Daily Generations</p>
          <p style={{ color: limit.remaining <= 1 ? t.danger : t.textPrimary, fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>
            {limit.used} / {limit.limit} used
          </p>
          <div style={{
            width: '120px', height: '4px', background: t.bgTertiary, borderRadius: '2px'
          }}>
            <div style={{
              width: `${(limit.used / limit.limit) * 100}%`, height: '100%',
              background: limit.remaining <= 1 ? t.danger : t.accent,
              borderRadius: '2px', transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>

      {/* Upgrade Banner when limit hit */}
      {!limit.canGenerate && (
        <div style={{
          marginBottom: '20px', padding: '16px 20px',
          background: `linear-gradient(135deg, ${t.danger}15, ${t.accent}15)`,
          border: `1px solid ${t.danger}44`, borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>
              🚫 Daily limit reached!
            </p>
            <p style={{ color: t.textSecondary, fontSize: '13px', margin: 0 }}>
              You've used all 5 free generations today. Upgrade to Creator for unlimited generations!
            </p>
          </div>
          <button
            onClick={onUpgrade}
            style={{
              padding: '10px 20px', background: t.accent, color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '16px'
            }}
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Platform Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {platforms.map(p => (
          <div key={p.id} onClick={() => setPlatform(p.id)} style={{
            padding: '16px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
            background: platform === p.id ? t.accentSubtle : t.bgCard,
            border: `1px solid ${platform === p.id ? t.accent : t.border}`,
            transition: 'all 0.15s'
          }}>
            <p style={{ fontSize: '22px', margin: '0 0 6px', color: platform === p.id ? t.accent : t.textSecondary }}>{p.icon}</p>
            <p style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: platform === p.id ? t.accent : t.textSecondary }}>{p.label}</p>
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div style={{
        background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: '12px', padding: '24px', marginBottom: '16px',
        boxShadow: t.shadowCard
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ color: t.accent, fontSize: '16px' }}>✦</span>
          <h2 style={{ color: t.textPrimary, fontSize: '18px', fontWeight: 600, margin: 0 }}>
            Create {activePlatform?.label} Content
          </h2>
        </div>
        <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
          Powered by advanced AI technology
        </p>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={!limit.canGenerate}
          placeholder={limit.canGenerate ? "Describe the topic, tone, and any specific details you want included..." : "Upgrade to continue generating content..."}
          style={{
            width: '100%', minHeight: '140px',
            background: limit.canGenerate ? t.bgSecondary : t.bgTertiary,
            border: `1px solid ${t.border}`, borderRadius: '8px',
            padding: '14px', color: t.textPrimary, fontSize: '14px',
            resize: 'vertical', outline: 'none', transition: 'border-color 0.15s',
            boxSizing: 'border-box', lineHeight: '1.6',
            opacity: limit.canGenerate ? 1 : 0.6
          }}
          onFocus={e => { if (limit.canGenerate) e.target.style.borderColor = t.accent; }}
          onBlur={e => e.target.style.borderColor = t.border}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ color: t.textMuted, fontSize: '12px' }}>{text.length} / 5000</span>
          <button
            onClick={limit.canGenerate ? handleGenerate : onUpgrade}
            disabled={loading || (!limit.canGenerate ? false : !text.trim())}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px',
              background: !limit.canGenerate ? t.danger : loading || !text.trim() ? t.textMuted : t.accent,
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s'
            }}
          >
            <span>{!limit.canGenerate ? '🔒' : '⚡'}</span>
            {loading ? 'Generating...' : !limit.canGenerate ? 'Upgrade to Generate' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Tone Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {tones.map(t2 => (
          <button key={t2} onClick={() => setTone(t2)} style={{
            padding: '10px', borderRadius: '8px',
            background: tone === t2 ? t.accentSubtle : t.bgCard,
            border: `1px solid ${tone === t2 ? t.accent : t.border}`,
            color: tone === t2 ? t.accent : t.textSecondary,
            fontSize: '13px', fontWeight: tone === t2 ? 600 : 400,
            transition: 'all 0.15s', cursor: 'pointer'
          }}>{t2}</button>
        ))}
      </div>

      {/* Advanced Options */}
      <div style={{
        background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: '12px', padding: '20px', marginBottom: '16px'
      }}>
        <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>Advanced Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p style={{ color: t.textSecondary, fontSize: '12px', fontWeight: 500, margin: '0 0 8px' }}>Audience</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {audiences.map(a => (
                <button key={a} onClick={() => setAudience(a)} style={{
                  padding: '5px 12px', borderRadius: '6px',
                  background: audience === a ? t.accentSubtle : t.bgSecondary,
                  border: `1px solid ${audience === a ? t.accent : t.border}`,
                  color: audience === a ? t.accent : t.textSecondary,
                  fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s'
                }}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: t.textSecondary, fontSize: '12px', fontWeight: 500, margin: '0 0 8px' }}>Length</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Short', 'Medium', 'Long'].map(l => (
                <button key={l} style={{
                  padding: '5px 12px', borderRadius: '6px',
                  background: t.bgSecondary, border: `1px solid ${t.border}`,
                  color: t.textSecondary, fontSize: '12px', cursor: 'pointer'
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Output */}
      <div style={{
        background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: '12px', padding: '20px'
      }}>
        <h3 style={{ color: t.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>
          Preview & History
        </h3>
        <p style={{ color: t.textSecondary, fontSize: '12px', margin: '0 0 16px' }}>
          Your generated content will appear here.
        </p>

        {output ? (
          <div>
            <div style={{
              background: t.bgSecondary, border: `1px solid ${t.border}`,
              borderRadius: '8px', padding: '16px', whiteSpace: 'pre-wrap',
              color: t.textPrimary, fontSize: '14px', lineHeight: '1.7',
              marginBottom: '12px', minHeight: '100px'
            }}>
              {output}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{
                  padding: '8px 16px', background: copied ? t.success : t.bgSecondary,
                  border: `1px solid ${copied ? t.success : t.border}`,
                  borderRadius: '8px', color: copied ? 'white' : t.textSecondary,
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button onClick={handleGenerate} disabled={!limit.canGenerate} style={{
                padding: '8px 16px', background: t.bgSecondary,
                border: `1px solid ${t.border}`, borderRadius: '8px',
                color: t.textSecondary, fontSize: '13px', cursor: 'pointer'
              }}>🔄 Regenerate</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', border: `1px dashed ${t.border}`, borderRadius: '8px' }}>
            <p style={{ color: t.textMuted, fontSize: '14px', margin: 0 }}>Generated content will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}