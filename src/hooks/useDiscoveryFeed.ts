
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDiscoveryFeed() {
  return useQuery({
    queryKey: ["discovery_feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discovery_feed")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000 // live update feed
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user_id,
      content,
      image_url = null,
    }: {
      user_id: string;
      content: string;
      image_url?: string | null;
    }) => {
      // Insert post
      const { error } = await supabase.from("posts").insert([
        { user_id, content, image_url }
      ]);
      if (error) throw error;
      // Update stats
      await supabase.rpc("increment_creator_stat", { creator_id: user_id, stat_type: "views", increment_amount: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery_feed"] });
    }
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user_id,
      title,
      track_url,
      description = "",
      cover_url = null,
    }: {
      user_id: string;
      title: string;
      track_url: string;
      description?: string;
      cover_url?: string | null;
    }) => {
      const { error } = await supabase.from("tracks").insert([{
        user_id,
        title,
        track_url,
        description,
        cover_url
      }]);
      if (error) throw error;
      await supabase.rpc("increment_creator_stat", { creator_id: user_id, stat_type: "views", increment_amount: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery_feed"] });
    }
  });
}
