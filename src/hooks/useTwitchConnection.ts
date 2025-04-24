
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useTwitchConnection(userId: string) {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectTwitch = async (twitchUsername: string) => {
    if (!twitchUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a valid Twitch username",
        variant: "destructive",
      });
      return null;
    }
    
    setIsConnecting(true);
    try {
      const { data, error } = await supabase
        .from('twitch_connections')
        .upsert({
          user_id: userId,
          twitch_username: twitchUsername,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Twitch Connected",
        description: `Successfully connected Twitch account: ${twitchUsername}`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect Twitch account",
        variant: "destructive",
      });
      console.error("Twitch connection error:", error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectTwitch = async () => {
    try {
      const { error } = await supabase
        .from('twitch_connections')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Twitch Disconnected",
        description: "Twitch account has been disconnected",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Could not disconnect Twitch account",
        variant: "destructive",
      });
      console.error("Twitch disconnection error:", error);
      return false;
    }
  };

  return { connectTwitch, disconnectTwitch, isConnecting };
}

export function useTwitchStatus(userId: string) {
  const [twitchConnection, setTwitchConnection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTwitchConnection = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('twitch_connections')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setTwitchConnection(data);
    } catch (error) {
      console.error("Error fetching Twitch connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { twitchConnection, isLoading, fetchTwitchConnection };
}
