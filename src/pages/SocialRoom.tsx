
import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { Send, Users, MessageSquare, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

interface OnlineUser {
  id: string;
  username: string;
  avatar_url: string | null;
  last_seen: string;
}

export default function SocialRoom() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages and set up real-time subscription
  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    
    // Mark user as online
    if (user) {
      updateUserOnlineStatus(true);
      
      // Set up presence tracking
      const socialRoomChannel = supabase.channel('social-room');
      
      socialRoomChannel
        .on('presence', { event: 'sync' }, () => {
          fetchOnlineUsers();
        })
        .on('presence', { event: 'join' }, () => {
          fetchOnlineUsers();
        })
        .on('presence', { event: 'leave' }, () => {
          fetchOnlineUsers();
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await socialRoomChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });
      
      // Listen for new messages
      const messageChannel = supabase
        .channel('public:social_room_messages')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'social_room_messages' },
            (payload) => {
              // Fetch the message with profile info
              fetchMessageWithProfile(payload.new.id);
            }
        )
        .subscribe();
      
      // Mark user as offline on unmount
      return () => {
        updateUserOnlineStatus(false);
        supabase.removeChannel(socialRoomChannel);
        supabase.removeChannel(messageChannel);
      };
    }
  }, [user]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const updateUserOnlineStatus = async (isOnline: boolean) => {
    try {
      await supabase.rpc('update_user_online_status', {
        p_user_id: user?.id,
        p_is_online: isOnline
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };
  
  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, last_seen')
        .eq('is_online', true)
        .order('username');
        
      if (error) throw error;
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };
  
  const fetchMessageWithProfile = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('social_room_messages')
        .select(`
          id, content, user_id, created_at,
          profiles:user_id (username, avatar_url)
        `)
        .eq('id', messageId)
        .single();
        
      if (error) throw error;
      
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  };
  
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_room_messages')
        .select(`
          id, content, user_id, created_at,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: true })
        .limit(100);
        
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('social_room_messages')
        .insert({
          content: message.trim(),
          user_id: user.id
        });
        
      if (error) throw error;
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4 flex flex-col h-screen`}>
          <h1 className="text-3xl font-bold mb-2">Social Room</h1>
          <p className="text-gray-300 mb-6">Chat with the community in real-time.</p>
          
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid grid-cols-2 w-64">
                <TabsTrigger value="chat">
                  <MessageSquare className="h-4 w-4 mr-2" /> Chat
                </TabsTrigger>
                <TabsTrigger value="online">
                  <Users className="h-4 w-4 mr-2" /> Online Users
                </TabsTrigger>
              </TabsList>
              <Badge variant="outline" className="bg-green-500/20 border-green-500/30 text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-2"></span>
                {onlineUsers.length} Online
              </Badge>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col space-y-4 mt-0">
              <Card className="flex-1 bg-audifyx-purple-dark/30 border-audifyx-purple/20">
                <CardContent className="p-4 h-[calc(100%-80px)] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-audifyx-purple" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4 pb-2">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex gap-3 ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.user_id !== user?.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                              <AvatarFallback>
                                {msg.profiles?.username?.[0].toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                            <div 
                              className={`rounded-lg px-3 py-2 max-w-xs md:max-w-md lg:max-w-lg break-words ${
                                msg.user_id === user?.id 
                                ? 'bg-audifyx-purple text-white' 
                                : 'bg-audifyx-purple-dark/80'
                              }`}
                            >
                              {msg.user_id !== user?.id && (
                                <div className="font-medium text-xs mb-1">
                                  {msg.profiles?.username || "Unknown User"}
                                </div>
                              )}
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {msg.user_id === user?.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.user_metadata?.avatar_url} />
                              <AvatarFallback>
                                {user?.user_metadata?.username?.[0].toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No messages yet. Be the first to say hello!</p>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t border-audifyx-purple/20">
                  <form 
                    className="flex items-center gap-2" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                  >
                    <Input 
                      placeholder="Type a message..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-background/10 border-audifyx-purple/30"
                      disabled={isSending || !user}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!message.trim() || isSending || !user}
                      className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="online" className="mt-0 flex-1">
              <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20 h-full">
                <CardHeader>
                  <CardTitle>Online Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {onlineUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {onlineUsers.map(user => (
                        <div key={user.id} className="flex items-center gap-3 bg-audifyx-purple/10 p-3 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.username}</p>
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              <span>Online now</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-12">
                      <p>No users currently online</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
