
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OnlineUser {
  id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
}

export function useOnlineUsers(searchQuery: string = '') {
  const {
    data,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['online-users', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, username, avatar_url, is_online, last_seen');
      
      if (searchQuery) {
        query = query.ilike('username', `%${searchQuery}%`);
      } else {
        query = query.eq('is_online', true);
      }
      
      const { data, error } = await query.order('username');
      
      if (error) throw error;
      return data as OnlineUser[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    // Subscribe to presence changes
    const channel = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        refetch();
      })
      .on('presence', { event: 'join' }, () => {
        refetch();
      })
      .on('presence', { event: 'leave' }, () => {
        refetch();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  
  return { data, error, isLoading };
}
