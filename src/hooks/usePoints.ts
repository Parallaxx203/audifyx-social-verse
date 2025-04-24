
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const POINTS_EVENTS = {
  POST_CREATION: 10,
  COMMENT: 5,
  LIKE: 2,
  FOLLOW: 3,
  STREAM_START: 15,
  STREAM_MINUTE: 1,
  DAILY_LOGIN: 5
};

export function usePoints() {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPoints();
    }
  }, [user]);

  const loadPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('points_balances')
        .select('total_points')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setTotalPoints(data?.total_points || 0);
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardPoints = async (eventType: keyof typeof POINTS_EVENTS, metadata = {}) => {
    try {
      const points = POINTS_EVENTS[eventType];
      const { error } = await supabase
        .from('points_events')
        .insert({
          user_id: user?.id,
          event_type: eventType,
          points,
          metadata
        });

      if (error) throw error;
      await loadPoints();
      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  };

  return { totalPoints, loading, awardPoints };
}
