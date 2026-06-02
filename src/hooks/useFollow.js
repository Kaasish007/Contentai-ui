import { useState, useEffect, useCallback } from 'react';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useFollow(currentUserId, targetUserId) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;
    fetch(`${BACKEND}/api/follow/status?follower_id=${currentUserId}&following_id=${targetUserId}`)
      .then(r => r.json())
      .then(data => { if (data.following !== undefined) setFollowing(data.following); })
      .catch(err => console.log('Follow status error:', err));
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    if (!targetUserId) return;
    fetch(`${BACKEND}/api/follow/counts?user_id=${targetUserId}`)
      .then(r => r.json())
      .then(data => {
        if (data.followers !== undefined) {
          setCounts({ followers: data.followers, following: data.following });
        }
      })
      .catch(err => console.log('Follow counts error:', err));
  }, [targetUserId]);

  const toggle = useCallback(async () => {
    if (!currentUserId || !targetUserId || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/follow/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_id: currentUserId,
          following_id: targetUserId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        console.log('Follow error:', err);
        return;
      }

      const data = await res.json();
      console.log('Follow result:', data);
      setFollowing(data.following);
      setCounts(prev => ({
        ...prev,
        followers: data.following ? prev.followers + 1 : Math.max(0, prev.followers - 1)
      }));
    } catch (err) {
      console.log('Follow toggle error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, targetUserId, loading]);

  return { following, loading, counts, toggle };
}