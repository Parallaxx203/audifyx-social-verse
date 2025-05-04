
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    username: string;
    avatar_url?: string;
  };
}

interface StreamerInfo {
  id: string;
  twitch_username: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
}

interface LiveStreamChatProps {
  streamer: StreamerInfo | null;
}

export function LiveStreamChat({ streamer }: LiveStreamChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamer) {
      fetchChatMessages();
      
      // Set up subscription for new messages
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${streamer.id}`,
        }, payload => {
          fetchMessageWithSender(payload.new.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [streamer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatMessages = async () => {
    if (!streamer) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id (username, avatar_url)
        `)
        .eq('receiver_id', streamer.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        ...msg,
        sender: msg.profiles
      })) || [];
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  const fetchMessageWithSender = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id (username, avatar_url)
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;

      if (data) {
        const newMessage = {
          ...data,
          sender: data.profiles
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Error fetching new message:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !streamer || !user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: message,
          sender_id: user.id,
          receiver_id: streamer.id,
          read: false
        });
      
      if (error) throw error;
      
      // Clear the message input
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-2">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-2">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={msg.sender?.avatar_url} />
                <AvatarFallback>
                  {msg.sender?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium">
                  {msg.sender?.username || "User"}
                </p>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </p>
        )}
        <div ref={messageEndRef} />
      </div>
      <div className="mt-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="bg-background/10 border-audifyx-purple/30"
          />
          <Button
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            size="icon"
            onClick={sendMessage}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
