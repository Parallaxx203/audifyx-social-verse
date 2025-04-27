import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useToast } from 'react-query';

export const POINTS_EVENTS = {
  POST_CREATION: 10,
  COMMENT: 5,
  LIKE: 2,
  FOLLOW: 3,
  STREAM_START: 15,
  STREAM_MINUTE: 1,
  DAILY_LOGIN: 5,
  SHARE: 3 // Added SHARE event
};

export type PointEventType = keyof typeof POINTS_EVENTS;

export function usePoints() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["points", user?.id],
    queryFn: async () => {
      if (!user) return { points: 0 };
      const { data, error } = await supabase
        .from('points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data || { points: 0 };
    },
    enabled: !!user
  });

  const awardPoints = async (eventType: PointEventType, metadata = {}) => {
    try {
      const points = POINTS_EVENTS[eventType];
      
      // Insert directly into point_transactions table instead of points_events
      const { error } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user?.id,
          reason: eventType,
          amount: points
        });

      if (error) throw error;
      
      // Update points in the points table
      await supabase.rpc('add_user_points', {
        user_id: user?.id,
        amount: points,
        reason: eventType
      });
      
      await loadPoints();
      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  };

  return { 
    totalPoints: data?.points || 0, 
    loading, 
    awardPoints 
  };
}
