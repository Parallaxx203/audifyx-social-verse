
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the Profile type to match the database structure
export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  banner_url?: string;
  website: string;
  bio: string;
  account_type: string;
  points: number;
  created_at: string;
  updated_at: string;
  is_online: boolean;
  last_seen: string;
  handle: string;
}

export function useProfile(uid: string | null) {
  return useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      if (!uid) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!uid,
  });
}

export function useUpdateProfile(uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", uid)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", uid] });
    },
  });
}

// Avatar/banner uploading helpers (for future use)
export async function uploadProfileFile(bucket: string, file: File, userId: string) {
  const path = `${userId}/${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  const url =
    supabase.storage
      .from(bucket)
      .getPublicUrl(path).data.publicUrl;
  return url;
}
