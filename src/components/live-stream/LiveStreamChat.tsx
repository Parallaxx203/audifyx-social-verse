
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizonal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Message = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
};

export function LiveStreamChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('room1')
      .on('broadcast', { event: 'chat' }, handleNewMessage)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      // First fetch the chat messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id, receiver_id')
        .eq('receiver_id', 'livestream')  // Using 'livestream' as a special receiver_id for stream chat
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) throw messagesError;

      // Then fetch user profiles for these messages
      if (messagesData && messagesData.length > 0) {
        const userIds = [...new Set(messagesData.map(msg => msg.sender_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine message data with profile data
        const messagesWithProfiles = messagesData.map(message => {
          const profile = profilesData?.find(p => p.id === message.sender_id);
          return {
            id: message.id,
            content: message.content,
            created_at: message.created_at,
            user_id: message.sender_id,
            username: profile?.username || 'Unknown User',
            avatar_url: profile?.avatar_url
          };
        });

        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (payload: { payload: { message: string; user_id: string; username: string; avatar_url: string | null } }) => {
    const { message, user_id, username, avatar_url } = payload.payload;
    
    // Generate a temporary ID as we won't have the real database ID
    const tempId = Math.random().toString(36).substr(2, 9);
    
    const newMsg: Message = {
      id: tempId,
      content: message,
      created_at: new Date().toISOString(),
      user_id,
      username,
      avatar_url
    };
    
    setMessages(prev => [...prev, newMsg]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      // First, get the user's profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Save message to database
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: user.id,
          receiver_id: 'livestream'  // Special receiver_id for live stream
        });
      
      if (insertError) throw insertError;
      
      // Broadcast message to all viewers
      await supabase
        .channel('room1')
        .send({
          type: 'broadcast',
          event: 'chat',
          payload: { 
            message: newMessage.trim(),
            user_id: user.id,
            username: profileData?.username || user.email?.split('@')[0] || 'User',
            avatar_url: profileData?.avatar_url
          }
        });
      
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-audifyx-purple-dark/30 border-audifyx-purple/20">
      <CardHeader className="bg-audifyx-purple-dark/50 py-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Live Chat</span>
          <span className="text-sm font-normal text-green-400">
            {messages.length} messages
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow p-3 overflow-y-auto max-h-[400px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2 ${msg.user_id === user?.id ? 'justify-end' : ''}`}
              >
                {msg.user_id !== user?.id && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={msg.avatar_url || undefined} />
                    <AvatarFallback>{msg.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.user_id === user?.id
                      ? 'bg-audifyx-purple text-white'
                      : 'bg-audifyx-purple-dark/40'
                  }`}
                >
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-xs opacity-70">{msg.username}</p>
                    <span className="text-xs opacity-50">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 break-words">{msg.content}</p>
                </div>
                
                {msg.user_id === user?.id && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user?.user_metadata?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-audifyx-purple-dark/50 border-audifyx-purple/30"
            maxLength={200}
            disabled={!user}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || !user} 
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
