
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { usePoints, PointEventType } from "@/hooks/usePoints";

export function useFollowUser() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { awardPoints } = usePoints();

  const isFollowing = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user?.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  const followUser = async (userId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to follow users",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;
      
      // Award points for following
      await awardPoints("FOLLOW" as PointEventType);
      
      toast({
        title: "Success",
        description: "You are now following this user"
      });
      
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "You have unfollowed this user"
      });
      
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    followUser, 
    unfollowUser, 
    isFollowing,
    loading 
  };
}
