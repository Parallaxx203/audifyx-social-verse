
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFollowUser() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Follow a user
   * @param userId The id of the user to follow
   * @returns A boolean indicating success
   */
  const followUser = async (userId: string): Promise<boolean> => {
    if (!user || !userId) return false;
    if (user.id === userId) return false; // Can't follow yourself
    
    setLoading(true);
    try {
      // Check if already following
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)
        .eq('following_id', userId);
        
      if (count && count > 0) return true; // Already following
      
      // Insert new follow
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Unfollow a user
   * @param userId The id of the user to unfollow
   * @returns A boolean indicating success
   */
  const unfollowUser = async (userId: string): Promise<boolean> => {
    if (!user || !userId) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if the current user is following another user
   * @param userId The id of the user to check
   * @returns A boolean indicating if they are being followed
   */
  const isFollowing = async (userId: string): Promise<boolean> => {
    if (!user || !userId) return false;
    
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)
        .eq('following_id', userId);
        
      if (error) throw error;
      return !!(count && count > 0);
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  /**
   * Get follow status and counts for a user
   * @param userId The id of the user to check
   */
  const checkFollowStatus = async (userId: string) => {
    if (!userId) return { isFollowing: false, followerCount: 0, followingCount: 0 };
    
    try {
      // Check if current user is following this user
      const isFollowing = user ? await isFollowing(userId) : false;
      
      // Get follower count
      const { count: followerCount, error: followerError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
        
      if (followerError) throw followerError;
      
      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);
        
      if (followingError) throw followingError;
      
      return {
        isFollowing,
        followerCount: followerCount || 0,
        followingCount: followingCount || 0
      };
    } catch (error) {
      console.error('Error checking follow status:', error);
      return { isFollowing: false, followerCount: 0, followingCount: 0 };
    }
  };

  return {
    followUser,
    unfollowUser,
    isFollowing,
    checkFollowStatus,
    loading
  };
}
