import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabase';
import FollowButton from '../components/FollowButton';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const platformColors = {
  LinkedIn: '#0a66c2', Twitter: '#1d9bf0',
  Instagram: '#e1306c', YouTube: '#ff0000', Blog: '#22c55e'
};

export default function Canvas({ user, onStarGifted }) {
  const { t } = useTheme();
  const [feed, setFeed] = useState('Latest');
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('LinkedIn');
  const [followingIds, setFollowingIds] = useState([]);

  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [commentLoading, setCommentLoading] = useState({});

  const [giftModal, setGiftModal] = useState(null);
  const [giftAmount, setGiftAmount] = useState(1);
  const [gifting, setGifting] = useState(false);
  const [giftMsg, setGiftMsg] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchFollowingIds();
  }, []);

  const fetchFollowingIds = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${BACKEND}/api/follow/following-ids?user_id=${user.id}`);
      const data = await res.json();
      setFollowingIds(data.ids || []);
    } catch (err) {
      console.log('Following IDs error:', err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('canvas_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.log('Fetch posts error:', err.message);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const { error } = await supabase.from('canvas_posts').insert({
        user_id: user?.id,
        user_email: user?.email,
        user_name: user?.email?.split('@')[0],
        content: newPost.trim(),
        platform: selectedPlatform,
        label: 'human',
        likes: 0
      });
      if (error) throw error;
      setNewPost('');
      await fetchPosts();
    } catch (err) {
      console.log('Post error:', err.message);
    }
    setPosting(false);
  };

  const handleLike = async (post) => {
    const isLiked = likedPosts.includes(post.id);
    const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
    setLikedPosts(isLiked
      ? likedPosts.filter(p => p !== post.id)
      : [...likedPosts, post.id]
    );
    setPosts(posts.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
    await supabase.from('canvas_posts').update({ likes: newLikes }).eq('id', post.id);
  };

  const fetchComments = async (postId) => {
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error) setComments(prev => ({ ...prev, [postId]: data }));
    setCommentLoading(prev => ({ ...prev, [postId]: false }));
  };

  const toggleComments = (postId) => {
    const isOpen = openComments[postId];
    setOpenComments(prev => ({ ...prev, [postId]: !isOpen }));
    if (!isOpen) fetchComments(postId);
  };

  const submitComment = async (postId) => {
    const text = commentInput[postId]?.trim();
    if (!text) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: authUser.id,
      user_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
      user_email: authUser.email,
      content: text,
    });
    if (!error) {
      setCommentInput(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    }
  };

  const openGiftModal = (post) => {
    if (post.user_id === user?.id) return;
    setGiftModal({
      post_id: post.id,
      to_user_id: post.user_id,
      to_name: post.user_name || post.user_email?.split('@')[0] || 'this creator'
    });
    setGiftAmount(1);
    setGiftMsg('');
  };

  const handleGift = async () => {
    if (!giftModal || gifting) return;
    setGifting(true);
    setGiftMsg('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${BACKEND}/api/stars/gift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to_user_id: giftModal.to_user_id,
          amount: giftAmount,
          post_id: giftModal.post_id
        })
      });
      const data = await res.json();
      if (data.success) {
        setGiftMsg('✅ Stars gifted successfully!');
        if (onStarGifted) onStarGifted();
        setTimeout(() => setGiftModal(null), 1500);
      } else {
        setGiftMsg(`❌ ${data.error || 'Failed to gift'}`);
      }
    } catch (err) {
      setGiftMsg('❌ Something went wrong');
    }
    setGifting(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'just now';
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getFilteredPosts = () => {
    if (feed === 'For You') {
      if (followingIds.length === 0) return [];
      return posts.filter(p => p.user_id && followingIds.some(id => id === p.user_id));
    }
    if (feed === 'Trending') {
      return [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    return posts;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div>
      {/* Gift Star Modal */}
      {giftModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '16px', padding: '28px', width: '320px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            <h3 style={{ color: t.textPrimary, fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>
              ⭐ Gift Stars
            </h3>
            <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 20px' }}>
              Send stars to <strong style={{ color: t.accent }}>{giftModal.to_name}</strong>
            </p>

            <p style={{ color: t.textMuted, fontSize: '12px', margin: '0 0 8px' }}>How many stars?</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[1, 3, 5, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setGiftAmount(n)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                    background: giftAmount === n ? t.accent : t.bgSecondary,
                    color: giftAmount === n ? 'white' : t.textSecondary,
                    fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            {giftMsg && (
              <p style={{ fontSize: '13px', margin: '0 0 12px', color: giftMsg.startsWith('✅') ? t.success : t.danger }}>
                {giftMsg}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setGiftModal(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: `1px solid ${t.border}`, background: 'transparent',
                  color: t.textSecondary, cursor: 'pointer', fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGift}
                disabled={gifting}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: gifting ? `${t.accent}66` : t.accent,
                  color: 'white', cursor: gifting ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: 600
                }}
              >
                {gifting ? 'Gifting...' : `Gift ⭐ ${giftAmount}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
          The Canvas
        </h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
          Where creativity meets community
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

        <div>
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '20px',
            background: t.bgSecondary, borderRadius: '10px',
            padding: '4px', border: `1px solid ${t.border}`
          }}>
            {['Latest', 'Trending', 'For You'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setFeed(tab);
                  if (tab === 'For You') fetchFollowingIds();
                }}
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: t.textMuted }}>
              Loading posts...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px',
              border: `1px dashed ${t.border}`, borderRadius: '12px'
            }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>
                {feed === 'For You' ? '👥' : '🎨'}
              </p>
              <p style={{ color: t.textMuted, fontSize: '14px' }}>
                {feed === 'For You'
                  ? 'Follow some creators to see their posts here!'
                  : 'No posts yet. Be the first to share!'}
              </p>
            </div>
          ) : (
            filteredPosts.map(post => (
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '14px'
                    }}>
                      {(post.user_name || post.user_email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, color: t.textPrimary, fontWeight: 600, fontSize: '14px' }}>
                        {post.user_name || post.user_email?.split('@')[0] || 'Anonymous'}
                      </p>
                      <p style={{ margin: 0, color: t.textMuted, fontSize: '12px' }}>{formatTime(post.created_at)}</p>
                    </div>
                    {post.user_id && post.user_id !== user?.id && (
                      <FollowButton
                        currentUserId={user?.id}
                        targetUserId={post.user_id}
                        size="sm"
                      />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {post.platform && (
                      <span style={{
                        padding: '3px 8px', borderRadius: '20px', fontSize: '11px',
                        background: `${platformColors[post.platform] || t.accent}22`,
                        color: platformColors[post.platform] || t.accent, fontWeight: 500
                      }}>
                        {post.platform}
                      </span>
                    )}
                    <span style={{
                      padding: '3px 8px', borderRadius: '20px', fontSize: '11px',
                      background: post.label === 'ai' ? `${t.accent}22` : `${t.success}22`,
                      color: post.label === 'ai' ? t.accent : t.success, fontWeight: 500
                    }}>
                      {post.label === 'ai' ? '🤖 AI' : '✍️ Human'}
                    </span>
                  </div>
                </div>

                <p style={{ color: t.textPrimary, lineHeight: '1.6', fontSize: '14px', margin: '0 0 16px' }}>
                  {post.content}
                </p>

                <div style={{ display: 'flex', gap: '16px', borderTop: `1px solid ${t.border}`, paddingTop: '12px' }}>
                  <button
                    onClick={() => handleLike(post)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: likedPosts.includes(post.id) ? t.danger : t.textSecondary,
                      fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {likedPosts.includes(post.id) ? '❤️' : '🤍'} {post.likes || 0}
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: openComments[post.id] ? t.accent : t.textSecondary,
                      fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    💬 {comments[post.id]?.length || 0}
                  </button>

                  <button
                    onClick={() => openGiftModal(post)}
                    style={{
                      background: 'none', border: 'none',
                      cursor: post.user_id === user?.id ? 'not-allowed' : 'pointer',
                      color: post.user_id === user?.id ? t.textMuted : t.textSecondary,
                      fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px',
                      opacity: post.user_id === user?.id ? 0.4 : 1
                    }}
                  >
                    ⭐ Gift Star
                  </button>

                  <button style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: t.textSecondary, fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    📤 Share
                  </button>
                </div>

                {openComments[post.id] && (
                  <div style={{
                    marginTop: '12px', background: t.bgSecondary,
                    borderRadius: '10px', padding: '14px',
                    border: `1px solid ${t.border}`
                  }}>
                    {commentLoading[post.id] ? (
                      <p style={{ color: t.textMuted, fontSize: '13px', margin: '0 0 10px' }}>Loading comments...</p>
                    ) : comments[post.id]?.length === 0 ? (
                      <p style={{ color: t.textMuted, fontSize: '13px', margin: '0 0 10px' }}>No comments yet. Be the first!</p>
                    ) : (
                      comments[post.id]?.map(c => (
                        <div key={c.id} style={{ marginBottom: '10px' }}>
                          <span style={{ color: t.accent, fontWeight: 600, fontSize: '13px' }}>
                            {c.user_name || c.user_email}
                          </span>
                          <p style={{ color: t.textPrimary, fontSize: '13px', margin: '2px 0 0 0', lineHeight: '1.5' }}>
                            {c.content}
                          </p>
                          <p style={{ color: t.textMuted, fontSize: '11px', margin: '2px 0 0 0' }}>
                            {formatTime(c.created_at)}
                          </p>
                        </div>
                      ))
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input
                        value={commentInput[post.id] || ''}
                        onChange={e => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                        placeholder="Write a comment..."
                        style={{
                          flex: 1, padding: '8px 12px', borderRadius: '8px',
                          border: `1px solid ${t.border}`, background: t.bgCard,
                          color: t.textPrimary, fontSize: '13px', outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        style={{
                          padding: '8px 14px', background: t.accent, color: 'white',
                          border: 'none', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 600
                        }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div>
          <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '16px', marginBottom: '16px'
          }}>
            <h3 style={{ color: t.textPrimary, fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
              ✍️ Share Something
            </h3>
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="What's on your mind? Share with the community..."
              style={{
                width: '100%', height: '80px', background: t.bgSecondary,
                border: `1px solid ${t.border}`, borderRadius: '8px',
                padding: '10px', color: t.textPrimary, fontSize: '13px',
                resize: 'none', outline: 'none', boxSizing: 'border-box'
              }}
            />
            <select
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              style={{
                width: '100%', marginTop: '8px', padding: '7px 10px',
                background: t.bgSecondary, border: `1px solid ${t.border}`,
                borderRadius: '8px', color: t.textPrimary, fontSize: '13px',
                outline: 'none', cursor: 'pointer'
              }}
            >
              {Object.keys(platformColors).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button
              onClick={handlePost}
              disabled={posting || !newPost.trim()}
              style={{
                marginTop: '8px', width: '100%', padding: '8px',
                background: posting || !newPost.trim() ? `${t.accent}66` : t.accent,
                color: 'white', border: 'none',
                borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                cursor: posting || !newPost.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {posting ? 'Publishing...' : 'Publish to Canvas'}
            </button>
          </div>

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