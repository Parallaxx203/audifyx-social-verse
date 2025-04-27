
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreatorStats {
  views_count: number;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  total_play_time: number;
  followers_count: number;
  following_count: number;
  tracks_count: number;
}

export function useCreatorStats(uid: string | null) {
  return useQuery({
    queryKey: ["creator_stats", uid],
    queryFn: async () => {
      if (!uid) return null;
      
      // Get creator stats
      const { data: stats, error: statsError } = await supabase
        .from("creator_stats")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (statsError) throw statsError;

      // Get follower count
      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: 'exact', head: true })
        .eq("following_id", uid);

      // Get following count
      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: 'exact', head: true })
        .eq("follower_id", uid);

      // Get tracks count
      const { count: tracksCount } = await supabase
        .from("tracks")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", uid);

      return {
        ...(stats || {
          views_count: 0,
          likes_count: 0,
          shares_count: 0,
          comments_count: 0,
          total_play_time: 0,
        }),
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        tracks_count: tracksCount || 0,
      } as CreatorStats;
    },
    enabled: !!uid,
    refetchInterval: 5000
  });
}
