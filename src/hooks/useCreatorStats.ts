
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCreatorStats(uid: string | null) {
  return useQuery({
    queryKey: ["creator_stats", uid],
    queryFn: async () => {
      if (!uid) return null;
      const { data, error } = await supabase
        .from("creator_stats")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      // If stats not present, default to zero
      return data || {
        views_count: 0,
        likes_count: 0,
        shares_count: 0,
        comments_count: 0,
        total_play_time: 0,
      };
    },
    enabled: !!uid,
    refetchInterval: 5000 // live updates
  });
}
