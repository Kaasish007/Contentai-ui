import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const samplePosts = [
  {
    id: 1, user: 'Rahul K', avatar: 'R', platform: 'LinkedIn', label: 'ai',
    content: '🌎 Artificial Intelligence is transforming every industry! From healthcare to finance, AI is revolutionizing how we work and live. The future belongs to those who embrace this change! #AI #Innovation',
    likes: 42, comments: 8, time: '2 hours ago'
  },
  {
    id: 2, user: 'Priya S', avatar: 'P', platform: 'Instagram', label: 'human',
    content: '✨ Sometimes the best moments are the ones you never planned. Today was one of those days — spontaneous, beautiful, and full of life. Grateful for every second! 🌸 #Blessed #GoodVibes',
    likes: 128, comments: 24, time: '4 hours ago'
  },
  {
    id: 3, user: 'Arun M', avatar: 'A', platform: 'Twitter', label: 'human',
    content: '1/ The secret to consistency is not motivation — it\'s systems. Build the right systems and success becomes inevitable. 🧵 Thread incoming...',
    likes: 89, comments: 15, time: '6 hours ago'
  },
  {
    id: 4, user: 'Sneha R', avatar: 'S', platform: 'LinkedIn', label: 'ai',
    content: '🚀 Just launched my new product after 6 months of hard work! The journey was tough but worth every moment. Key lesson: ship early, iterate fast. What\'s your biggest product launch lesson? #Startup #ProductLaunch',
    likes: 234, comments: 41, time: '1 day ago'
  },
];

const platformColors = {
  LinkedIn: '#0a66c2', Twitter: '#1d9bf0',
  Instagram: '#e1306c', YouTube: '#ff0000', Blog: '#22c55e'
};

export default function Canvas() {
  const { t } = useTheme();
  const [feed, setFeed] = useState('Trending');
  const [posts, setPosts] = useState(samplePosts);
  const [likedPosts, setLikedPosts] = useState([]);

  const handleLike = (id) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(likedPosts.filter(p => p !== id));
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p));
    } else {
      setLikedPosts([...likedPosts, id]);
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
          The Canvas
        </h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
          Where creativity meets community
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

        {/* Feed */}
        <div>
          {/* Feed Switcher */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '20px',
            background: t.bgSecondary, borderRadius: '10px',
            padding: '4px', border: `1px solid ${t.border}`
          }}>
            {['Trending', 'Latest', 'For You'].map(tab => (
              <button
                key={tab}
                onClick={() => setFeed(tab)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '7px', border: 'none',
                  background: feed === tab ? t.accent : 'transparent',
                  color: feed === tab ? 'white' : t.textSecondary,
                  cursor: 'pointer', fontSize: '13px', fontWeight: feed === tab ? 600 : 400,
                  transition: 'all 0.15s'
                }}
              >
                {tab === 'Trending' && '🔥 '}
                {tab === 'Latest' && '🆕 '}
                {tab === 'For You' && '💡 '}
                {tab}
              </button>
            ))}
          </div>

          {/* Posts */}
          {posts.map(post => (
            <div
              key={post.id}
              style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: '12px', padding: '20px', marginBottom: '12px',
                boxShadow: t.shadowCard, transition: 'border-color 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = t.borderHover}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
            >
              {/* Post Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '14px'
                  }}>
                    {post.avatar}
                  </div>
                  <div>
                    <p style={{ margin: 0, color: t.textPrimary, fontWeight: 600, fontSize: '14px' }}>{post.user}</p>
                    <p style={{ margin: 0, color: t.textMuted, fontSize: '12px' }}>{post.time}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '20px', fontSize: '11px',
                    background: `${platformColors[post.platform]}22`,
                    color: platformColors[post.platform], fontWeight: 500
                  }}>
                    {post.platform}
                  </span>
                  <span style={{
                    padding: '3px 8px', borderRadius: '20px', fontSize: '11px',
                    background: post.label === 'ai' ? `${t.accent}22` : `${t.success}22`,
                    color: post.label === 'ai' ? t.accent : t.success, fontWeight: 500
                  }}>
                    {post.label === 'ai' ? '🤖 AI' : '✍️ Human'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <p style={{ color: t.textPrimary, lineHeight: '1.6', fontSize: '14px', margin: '0 0 16px' }}>
                {post.content}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '16px', borderTop: `1px solid ${t.border}`, paddingTop: '12px' }}>
                <button
                  onClick={() => handleLike(post.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: likedPosts.includes(post.id) ? t.danger : t.textSecondary,
                    fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {likedPosts.includes(post.id) ? '❤️' : '🤍'} {post.likes}
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  💬 {post.comments}
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⭐ Gift Star
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📤 Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div>
          {/* Write Post */}
          <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '16px', marginBottom: '16px'
          }}>
            <h3 style={{ color: t.textPrimary, fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
              ✍️ Share Something
            </h3>
            <textarea
              placeholder="What's on your mind? Share with the community..."
              style={{
                width: '100%', height: '80px', background: t.bgSecondary,
                border: `1px solid ${t.border}`, borderRadius: '8px',
                padding: '10px', color: t.textPrimary, fontSize: '13px',
                resize: 'none', outline: 'none', boxSizing: 'border-box'
              }}
            />
            <button style={{
              marginTop: '8px', width: '100%', padding: '8px',
              background: t.accent, color: 'white', border: 'none',
              borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}>
              Publish to Canvas
            </button>
          </div>

          {/* Trending Topics */}
          <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '16px'
          }}>
            <h3 style={{ color: t.textPrimary, fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
              🔥 Trending Topics
            </h3>
            {['#AIContent', '#LinkedInTips', '#CreatorEconomy', '#TwitterGrowth', '#ContentStrategy'].map(tag => (
              <div key={tag} style={{
                padding: '8px 0', borderBottom: `1px solid ${t.border}`,
                color: t.accent, fontSize: '13px', cursor: 'pointer'
              }}>
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}