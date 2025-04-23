
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useOnlineUsers(query: string = "") {
  return useQuery({
    queryKey: ["online_users", query],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("id, username, account_type, avatar_url, is_online, last_seen, handle")
        .order("is_online", { ascending: false })
        .order("last_seen", { ascending: false });
      if (query) {
        q = q.ilike("username", `%${query}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    }
  });
}
