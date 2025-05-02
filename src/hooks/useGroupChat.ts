
import { supabase } from "@/integrations/supabase/client";
import { GroupChat } from "@/types/chat";
import { useToast } from "@/hooks";

export function useGroupChat() {
  const { toast } = useToast();

  const createGroupChat = async (name: string, memberIds: string[]) => {
    try {
      const { data, error } = await supabase
        .rpc('create_group_chat', {
          p_name: name,
          p_creator_id: supabase.auth.getUser().then(res => res.data.user?.id) || '',
          p_member_ids: memberIds
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive"
      });
      return null;
    }
  };

  const getUserGroupChats = async (userId: string): Promise<GroupChat[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_group_chats', {
          p_user_id: userId
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching group chats:', error);
      return [];
    }
  };

  return { createGroupChat, getUserGroupChats };
}
