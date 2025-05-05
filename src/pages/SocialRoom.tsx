
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";

// Define the Message type
interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

export default function SocialRoom() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { data: onlineUsers } = useOnlineUsers();

  useEffect(() => {
    if (user) {
      fetchMessages();
      setUserOnline(true);
      
      // Subscribe to new messages
      const channel = supabase
        .channel('public:social_room_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'social_room_messages'
        }, () => {
          fetchMessages();
        })
        .subscribe();
      
      return () => {
        setUserOnline(false);
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setUserOnline = async (isOnline: boolean) => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);
      
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      // Create the table if it doesn't exist yet
      if (!(await checkIfSocialRoomMessagesTableExists())) {
        await createSocialRoomMessagesTable();
      }
      
      const { data, error } = await supabase
        .from('social_room_messages')
        .select(`
          id, 
          content, 
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      
      if (data) {
        setMessages(data as Message[]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. The social room may not be set up yet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the table exists
  const checkIfSocialRoomMessagesTableExists = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('social_room_messages')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  };

  // Create the table if it doesn't exist
  const createSocialRoomMessagesTable = async () => {
    try {
      await supabase.rpc('create_social_room_messages_table');
      toast({
        title: "Social Room Created",
        description: "The social room has been set up successfully!",
      });
    } catch (error) {
      console.error("Error creating social room messages table:", error);
    }
  };

  const sendMessage = async () => {
    if (!user || !message.trim()) return;
    
    try {
      const { error } = await supabase
        .from('social_room_messages')
        .insert({
          content: message.trim(),
          user_id: user.id
        });
      
      if (error) throw error;
      
      setMessage("");
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4 md:p-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Chat Area */}
              <div className="flex-1">
                <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/30">
                  <CardHeader className="border-b border-audifyx-purple/20">
                    <CardTitle className="flex items-center justify-between">
                      <span>Social Room</span>
                      <span className="text-sm font-normal text-gray-400">
                        {onlineUsers?.length || 0} online
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[60vh] flex flex-col">
                      <div className="flex-1 overflow-y-auto p-4">
                        {isLoading ? (
                          <div className="flex justify-center items-center h-full">
                            <p>Loading messages...</p>
                          </div>
                        ) : messages.length > 0 ? (
                          <div className="space-y-4">
                            {messages.map((msg) => (
                              <div key={msg.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={msg.profile?.avatar_url || ""} />
                                  <AvatarFallback>
                                    {msg.profile?.username?.[0]?.toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {msg.profile?.username || "Unknown User"}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {formatTimestamp(msg.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 mt-1">{msg.content}</p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-full">
                            <p className="text-center text-gray-400">
                              No messages yet. Be the first to say something!
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-audifyx-purple/20">
                        <div className="flex gap-2">
                          <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="resize-none bg-audifyx-purple-dark/30"
                            rows={1}
                          />
                          <Button 
                            onClick={sendMessage} 
                            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Online Users */}
              <div className="w-full md:w-64">
                <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/30">
                  <CardHeader className="border-b border-audifyx-purple/20">
                    <CardTitle className="text-base">Online Users</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(60vh-64px)] overflow-y-auto">
                    {onlineUsers && onlineUsers.length > 0 ? (
                      <div className="space-y-3 py-2">
                        {onlineUsers.map((user) => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url || ""} />
                                <AvatarFallback>
                                  {user.username[0]?.toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                            </div>
                            <span className="text-sm font-medium">{user.username}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-4 text-sm">
                        No users online
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
