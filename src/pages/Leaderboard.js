import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabase';
import FollowButton from '../components/FollowButton';

const leagueConfig = {
  diamond: { label: 'Diamond', color: '#60a5fa', bg: '#60a5fa15', minStars: 2000 },
  gold:    { label: 'Gold',    color: '#fbbf24', bg: '#fbbf2415', minStars: 1000 },
  silver:  { label: 'Silver',  color: '#94a3b8', bg: '#94a3b815', minStars: 500  },
  bronze:  { label: 'Bronze',  color: '#f97316', bg: '#f9731615', minStars: 100  },
};

const getLeague = (stars) => {
  if (stars >= 2000) return 'diamond';
  if (stars >= 1000) return 'gold';
  if (stars >= 500)  return 'silver';
  if (stars >= 100)  return 'bronze';
  return null;
};

const getRank = (stars) => {
  if (stars >= 2000) return '🌟 Icon';
  if (stars >= 1000) return '👑 Legend';
  if (stars >= 500)  return '💎 Visionary';
  if (stars >= 200)  return '⭐ Stellar';
  if (stars >= 100)  return '🔥 Blazer';
  return '🌱 Newcomer';
};

export default function Leaderboard({ user }) {
  const { t } = useTheme();
  const [activeView, setActiveView] = useState('galaxy');
  const [leaderboard, setLeaderboard] = useState([]);
  const [wallOfFame, setWallOfFame] = useState([]);
  const [categoryKings, setCategoryKings] = useState([]);
  const [userStars, setUserStars] = useState(0);
  const [loading, setLoading] = useState(true);

  const views = [
    { id: 'galaxy',   label: '🌌 Creator Leagues' },
    { id: 'rising',   label: '📈 Rising Stars' },
    { id: 'category', label: '🏆 Category Kings' },
    { id: 'fame',     label: '🎖️ Wall of Fame' },
  ];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchLeaderboard(), fetchWallOfFame(), fetchCategoryKings()]);
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    // Sum stars per user
    const { data: starsData, error } = await supabase
      .from('stars')
      .select('user_id, amount');
    if (error) return;

    // Aggregate totals
    const totals = {};
    starsData.forEach(row => {
      totals[row.user_id] = (totals[row.user_id] || 0) + (row.amount || 0);
    });

    // Get current user total
    if (user?.id) setUserStars(totals[user.id] || 0);

    // Get profiles for usernames
    const userIds = Object.keys(totals);
    if (userIds.length === 0) return;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username')
      .in('user_id', userIds);

    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.user_id] = p.username; });

    // Build sorted list
    const sorted = Object.entries(totals)
      .map(([uid, stars]) => ({
        user_id: uid,
        name: profileMap[uid] || uid.slice(0, 8),
        stars
      }))
      .sort((a, b) => b.stars - a.stars)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    setLeaderboard(sorted);
  };

  const fetchWallOfFame = async () => {
    const { data, error } = await supabase
      .from('canvas_posts')
      .select('id, user_id, user_name, content, likes, platform')
      .order('likes', { ascending: false })
      .limit(10);
    if (!error) setWallOfFame(data || []);
  };

  const fetchCategoryKings = async () => {
    const platforms = ['LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'Blog'];
    const platformColors = {
      LinkedIn: '#0a66c2', Twitter: '#1d9bf0',
      Instagram: '#e1306c', YouTube: '#ff0000', Blog: '#22c55e'
    };
    const results = [];
    for (const platform of platforms) {
      const { data } = await supabase
        .from('canvas_posts')
        .select('user_id, user_name, platform')
        .eq('platform', platform)
        .limit(100);
      if (!data || data.length === 0) continue;
      // Count posts per user
      const counts = {};
      data.forEach(p => {
        counts[p.user_id] = counts[p.user_id] || { name: p.user_name, count: 0, user_id: p.user_id };
        counts[p.user_id].count++;
      });
      const top = Object.values(counts).sort((a, b) => b.count - a.count)[0];
      if (top) results.push({ platform, color: platformColors[platform], king: top.name, posts: top.count, user_id: top.user_id });
    }
    setCategoryKings(results);
  };

  // Group leaderboard into leagues
  const leagueGroups = { diamond: [], gold: [], silver: [], bronze: [] };
  leaderboard.forEach(p => {
    const league = getLeague(p.stars);
    if (league) leagueGroups[league].push(p);
  });

  // Rising stars = top 3 by stars among lower ranked
  const risingStars = leaderboard.slice(0, 10).slice(-3).reverse();

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: t.textMuted }}>
      Loading leaderboard...
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: t.textPrimary, fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
          Leaderboard
        </h1>
        <p style={{ color: t.textSecondary, fontSize: '15px', margin: 0 }}>
          Top creators ranked by stars and contributions
        </p>
      </div>

      {/* View Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '24px',
        borderBottom: `1px solid ${t.border}`, paddingBottom: '0'
      }}>
        {views.map(view => (
          <button key={view.id} onClick={() => setActiveView(view.id)} style={{
            padding: '10px 16px', border: 'none', background: 'transparent',
            color: activeView === view.id ? t.accent : t.textSecondary,
            fontSize: '13px', fontWeight: activeView === view.id ? 600 : 400,
            cursor: 'pointer',
            borderBottom: activeView === view.id ? `2px solid ${t.accent}` : '2px solid transparent',
            transition: 'all 0.15s', marginBottom: '-1px'
          }}>
            {view.label}
          </button>
        ))}
      </div>

      {/* Creator Leagues */}
      {activeView === 'galaxy' && (
        <div>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: t.textMuted, border: `1px dashed ${t.border}`, borderRadius: '12px' }}>
              No users on the leaderboard yet. Start earning stars!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {Object.entries(leagueGroups).map(([league, players]) => {
                const config = leagueConfig[league];
                return (
                  <div key={league} style={{
                    background: t.bgCard, border: `1px solid ${config.color}44`,
                    borderRadius: '12px', padding: '20px', boxShadow: t.shadowCard
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: config.bg, border: `2px solid ${config.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                      }}>✦</div>
                      <div>
                        <p style={{ color: config.color, fontWeight: 700, fontSize: '16px', margin: 0 }}>
                          {config.label} League
                        </p>
                        <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>
                          {config.minStars}+ stars required
                        </p>
                      </div>
                    </div>

                    {players.length === 0 ? (
                      <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
                        No one here yet
                      </p>
                    ) : players.map(player => (
                      <div key={player.user_id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 0', borderBottom: `1px solid ${t.border}`
                      }}>
                        <span style={{ color: t.textMuted, fontSize: '12px', width: '20px' }}>#{player.rank}</span>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: config.bg, border: `1px solid ${config.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: config.color, fontWeight: 700, fontSize: '11px', flexShrink: 0
                        }}>
                          {player.name[0].toUpperCase()}
                        </div>
                        <span style={{ color: t.textPrimary, fontSize: '13px', flex: 1 }}>{player.name}</span>
                        <span style={{ color: t.star, fontSize: '12px', fontWeight: 600 }}>⭐ {player.stars}</span>
                        {player.user_id !== user?.id && (
                          <FollowButton currentUserId={user?.id} targetUserId={player.user_id} size="sm" />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Your Position */}
          <div style={{
            marginTop: '16px', padding: '16px 20px',
            background: t.bgCard, border: `1px solid ${t.accent}44`,
            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: t.accentSubtle, border: `2px solid ${t.accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.accent, fontWeight: 700, fontSize: '14px'
            }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>Your Position</p>
              <p style={{ color: t.textSecondary, fontSize: '12px', margin: 0 }}>Keep earning stars to climb the leagues!</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: t.star, fontWeight: 700, fontSize: '16px', margin: '0 0 2px' }}>{getRank(userStars)}</p>
              <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>⭐ {userStars} total stars</p>
            </div>
          </div>
        </div>
      )}

      {/* Rising Stars */}
      {activeView === 'rising' && (
        <div>
          <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
            Top creators by stars 🚀
          </p>
          {leaderboard.slice(0, 10).map((star, i) => (
            <div key={star.user_id} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '12px', padding: '16px 20px', marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '12px', boxShadow: t.shadowCard
            }}>
              <span style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: i < 3 ? ['#fbbf2422','#94a3b822','#f9731622'][i] : t.bgSecondary,
                border: `2px solid ${i < 3 ? ['#fbbf24','#94a3b8','#f97316'][i] : t.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i < 3 ? ['#fbbf24','#94a3b8','#f97316'][i] : t.textMuted,
                fontWeight: 700, fontSize: '12px', flexShrink: 0
              }}>
                {i + 1}
              </span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: t.accentSubtle, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: t.accent, fontWeight: 700, fontSize: '14px', flexShrink: 0
              }}>
                {star.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{star.name}</p>
                <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{getRank(star.stars)}</p>
              </div>
              <span style={{
                color: t.success, fontWeight: 700, fontSize: '15px',
                background: t.successSubtle, padding: '4px 10px', borderRadius: '20px'
              }}>
                ⭐ {star.stars}
              </span>
              {star.user_id !== user?.id && (
                <FollowButton currentUserId={user?.id} targetUserId={star.user_id} size="sm" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Kings */}
      {activeView === 'category' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {categoryKings.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: t.textMuted, border: `1px dashed ${t.border}`, borderRadius: '12px' }}>
              No posts yet on any platform
            </div>
          ) : categoryKings.map(cat => (
            <div key={cat.platform} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '12px', padding: '20px', textAlign: 'center',
              boxShadow: t.shadowCard, transition: 'border-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = cat.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${cat.color}22`, border: `1px solid ${cat.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: cat.color, fontWeight: 700, fontSize: '18px'
              }}>
                {cat.platform[0]}
              </div>
              <p style={{ color: t.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Best {cat.platform} Creator</p>
              <p style={{ color: t.textPrimary, fontWeight: 700, fontSize: '16px', margin: '0 0 4px' }}>{cat.king}</p>
              <p style={{ color: t.textMuted, fontSize: '12px', margin: '0 0 12px' }}>{cat.posts} posts</p>
              {cat.user_id !== user?.id && (
                <FollowButton currentUserId={user?.id} targetUserId={cat.user_id} size="sm" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wall of Fame */}
      {activeView === 'fame' && (
        <div>
          <p style={{ color: t.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
            🏆 Top 10 most liked posts of all time
          </p>
          {wallOfFame.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: t.textMuted, border: `1px dashed ${t.border}`, borderRadius: '12px' }}>
              No posts yet. Start posting on The Canvas!
            </div>
          ) : wallOfFame.map((post, i) => (
            <div key={post.id} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: '12px', padding: '16px 20px', marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '16px', boxShadow: t.shadowCard
            }}>
              <span style={{
                fontSize: '24px', fontWeight: 700, width: '32px', textAlign: 'center',
                color: ['#fbbf24','#94a3b8','#f97316'][i] || t.textMuted
              }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ color: t.textPrimary, fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>
                  {post.content?.slice(0, 60)}{post.content?.length > 60 ? '...' : ''}
                </p>
                <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>
                  by {post.user_name} · {post.platform}
                </p>
              </div>
              <div style={{ textAlign: 'right', marginRight: '8px' }}>
                <p style={{ color: t.danger, fontWeight: 700, fontSize: '16px', margin: 0 }}>❤️ {post.likes}</p>
              </div>
              {post.user_id !== user?.id && (
                <FollowButton currentUserId={user?.id} targetUserId={post.user_id} size="sm" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}