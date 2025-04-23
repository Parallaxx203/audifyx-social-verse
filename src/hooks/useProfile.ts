
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      return data;
    },
    enabled: !!uid,
  });
}

export function useUpdateProfile(uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", uid)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
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
