
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const usePointsSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: pointsData, isLoading, refetch } = useQuery({
    queryKey: ["user_points", user?.id],
    queryFn: async () => {
      if (!user) return { points: 0 };
      
      const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching points:", error);
        return { points: 0 };
      }
      
      return data || { points: 0 };
    },
    enabled: !!user
  });

  const addPoints = async (userId: string, amount: number, reason: string) => {
    if (!userId || amount <= 0) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc('add_user_points', {
        user_id: userId,
        points_to_add: amount
      });
      
      if (error) throw error;
      
      await refetch();
      return true;
    } catch (error) {
      console.error("Error adding points:", error);
      toast({
        title: "Error",
        description: "Failed to add points",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateEarnings = (points: number) => {
    return (points / 6000) * 3;
  };

  const addStreamViewPoints = async (streamerId: string) => {
    return addPoints(streamerId, 4.5, 'stream_view');
  };

  const addPostPoints = async (userId: string) => {
    return addPoints(userId, 15, 'post_creation');
  };

  return {
    points: pointsData?.points || 0,
    earnings: calculateEarnings(pointsData?.points || 0),
    isLoading,
    addPoints,
    calculateEarnings,
    addStreamViewPoints,
    addPostPoints,
    isProcessing
  };
};
