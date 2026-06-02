import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabase';

const platformColors = {
  linkedin: '#0a66c2', twitter: '#1d9bf0',
  instagram: '#e1306c', youtube: '#ff0000', blog: '#22c55e'
};

const platformLabel = {
  linkedin: 'LinkedIn', twitter: 'Twitter',
  instagram: 'Instagram', youtube: 'YouTube', blog: 'Blog'
};

const platformOptions = ['LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'Blog'];

export default function Projects({ onNavigate, user }) {
  const { t } = useTheme();
  const [filter, setFilter] = useState('All');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [copying, setCopying] = useState(null);

  // Post to Canvas modal
  const [postModal, setPostModal] = useState(null);
  const [postPlatform, setPostPlatform] = useState('LinkedIn');
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState('');

  const filters = ['All', 'LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'Blog'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data, error } = await supabase
        .from('generated_outputs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.log('Fetch projects error:', err.message);
    }
    setLoading(false);
  };

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopying(id);
    setTimeout(() => setCopying(null), 1500);
  };

  const openPostModal = (project) => {
    const guessedPlatform = platformLabel[project.output_type?.toLowerCase()] || 'LinkedIn';
    setPostPlatform(guessedPlatform);
    setPostMsg('');
    setPostModal(project);
  };

  const handlePostToCanvas = async () => {
    if (!postModal || posting) return;
    setPosting(true);
    setPostMsg('');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not logged in');
      const { error } = await supabase.from('canvas_posts').insert({
        user_id: authUser.id,
        user_email: authUser.email,
        user_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        content: postModal.content,
        platform: postPlatform,
        label: 'ai',
        likes: 0
      });
      if (error) throw error;
      setPostMsg('success');
    } catch (err) {
      setPostMsg('error');
      console.log('Post to canvas error:', err.message);
    }
    setPosting(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(p => p.output_type?.toLowerCase() === filter.toLowerCase());

  return (
    <div>

      {/* Post to Canvas Modal */}
      {postModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            {postMsg === 'success' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: '48px', margin: '0 0 12px' }}>🎉</p>
                <h3 style={{ color: t.textPrimary, fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
                  Posted to Canvas!
                </h3>
                <p style={{ color: t.textSecondary, fontSize: '14px', margin: '0 0 20px' }}>
                  Your content is now live on The Canvas.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setPostModal(null)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px',
                      border: `1px solid ${t.border}`, background: 'transparent',
                      color: t.textSecondary, cursor: 'pointer', fontSize: '14px'
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { setPostModal(null); onNavigate('canvas'); }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                      background: t.accent, color: 'white',
                      cursor: 'pointer', fontSize: '14px', fontWeight: 600
                    }}
                  >
                    View on Canvas
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ color: t.textPrimary, fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>
                  📤 Post to Canvas
                </h3>
                <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
                  Share this AI-generated content with the community
                </p>

                {/* Content Preview */}
                <div style={{
                  background: t.bgSecondary, border: `1px solid ${t.border}`,
                  borderRadius: '8px', padding: '12px', marginBottom: '16px',
                  maxHeight: '120px', overflowY: 'auto'
                }}>
                  <p style={{
                    color: t.textPrimary, fontSize: '13px',
                    lineHeight: '1.6', margin: 0
                  }}>
                    {postModal.content?.slice(0, 200)}
                    {postModal.content?.length > 200 ? '...' : ''}
                  </p>
                </div>

                {/* Platform Selector */}
                <p style={{ color: t.textMuted, fontSize: '12px', margin: '0 0 8px' }}>
                  Post as platform:
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {platformOptions.map(p => (
                    <button
                      key={p}
                      onClick={() => setPostPlatform(p)}
                      style={{
                        padding: '6px 12px', borderRadius: '20px', border: 'none',
                        background: postPlatform === p ? t.accent : t.bgSecondary,
                        color: postPlatform === p ? 'white' : t.textSecondary,
                        fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {postMsg === 'error' && (
                  <p style={{ color: t.danger, fontSize: '13px', margin: '0 0 12px' }}>
                    ❌ Failed to post. Please try again.
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setPostModal(null)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px',
                      border: `1px solid ${t.border}`, background: 'transparent',
                      color: t.textSecondary, cursor: 'pointer', fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostToCanvas}
                    disabled={posting}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                      background: posting ? `${t.accent}66` : t.accent,
                      color: 'white', cursor: posting ? 'not-allowed' : 'pointer',
                      fontSize: '14px', fontWeight: 600
                    }}
                  >
                    {posting ? 'Publishing...' : '📤 Publish'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
            Projects
          </h1>
          <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
            Your saved content and generation history
          </p>
        </div>
        <button
          onClick={() => onNavigate('generate')}
          style={{
            padding: '10px 20px', background: t.accent, color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px'
          }}
        >
          ⚡ New Generation
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              border: `1px solid ${filter === f ? t.accent : t.border}`,
              background: filter === f ? t.accentSubtle : 'transparent',
              color: filter === f ? t.accent : t.textSecondary,
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      {!loading && projects.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px', marginBottom: '20px'
        }}>
          {[
            { label: 'Total Generated', value: projects.length, icon: '📄' },
            { label: 'LinkedIn', value: projects.filter(p => p.output_type?.toLowerCase() === 'linkedin').length, icon: '💼' },
            { label: 'Twitter', value: projects.filter(p => p.output_type?.toLowerCase() === 'twitter').length, icon: '🐦' },
            { label: 'This Week', value: projects.filter(p => Date.now() - new Date(p.created_at).getTime() < 7 * 86400000).length, icon: '📅' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '10px', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>{stat.icon}</span>
              <div>
                <p style={{ color: t.textPrimary, fontWeight: 700, fontSize: '18px', margin: 0 }}>{stat.value}</p>
                <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: t.textMuted }}>
          Loading your projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: '12px', padding: '80px 40px', textAlign: 'center',
          boxShadow: t.shadowCard
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>◧</p>
          <h3 style={{ color: t.textPrimary, fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
            {filter === 'All' ? 'No projects yet' : `No ${filter} content yet`}
          </h3>
          <p style={{ color: t.textSecondary, fontSize: '14px', margin: '0 0 20px' }}>
            {filter === 'All'
              ? 'Start generating content to see your projects here'
              : `Generate some ${filter} content to see it here`}
          </p>
          <button
            onClick={() => onNavigate('generate')}
            style={{
              padding: '10px 24px', background: t.accent, color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            Generate Your First Content
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {filteredProjects.map(project => {
            const platform = project.output_type?.toLowerCase();
            const color = platformColors[platform] || t.accent;
            const label = platformLabel[platform] || project.output_type || 'Content';
            const isExpanded = expanded === project.id;

            return (
              <div
                key={project.id}
                style={{
                  background: t.bgCard, border: `1px solid ${t.border}`,
                  borderRadius: '12px', padding: '18px',
                  boxShadow: t.shadowCard, transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = color}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                    background: `${color}22`, color, fontWeight: 600
                  }}>
                    {label}
                  </span>
                  <span style={{ color: t.textMuted, fontSize: '11px' }}>
                    {formatTime(project.created_at)}
                  </span>
                </div>

                {/* Content Preview */}
                <p style={{
                  color: t.textPrimary, fontSize: '13px', lineHeight: '1.6',
                  margin: '0 0 12px',
                  display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: isExpanded ? 'visible' : 'hidden'
                }}>
                  {project.content}
                </p>

                {/* Actions */}
                <div style={{
                  display: 'flex', gap: '8px',
                  borderTop: `1px solid ${t.border}`, paddingTop: '10px'
                }}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : project.id)}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '6px',
                      border: `1px solid ${t.border}`, background: 'transparent',
                      color: t.textSecondary, fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    {isExpanded ? '▲ Less' : '▼ More'}
                  </button>
                  <button
                    onClick={() => handleCopy(project.content, project.id)}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '6px',
                      border: `1px solid ${copying === project.id ? t.success : t.border}`,
                      background: copying === project.id ? `${t.success}22` : 'transparent',
                      color: copying === project.id ? t.success : t.textSecondary,
                      fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    {copying === project.id ? '✅ Copied!' : '📋 Copy'}
                  </button>
                  <button
                    onClick={() => openPostModal(project)}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '6px',
                      border: `1px solid ${t.accent}44`,
                      background: `${t.accent}11`,
                      color: t.accent, fontSize: '12px', cursor: 'pointer',
                      fontWeight: 500, transition: 'all 0.15s'
                    }}
                  >
                    📤 Post
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}