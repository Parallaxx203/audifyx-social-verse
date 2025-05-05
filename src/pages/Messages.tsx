import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Users, Plus, Send, Phone, Video, UserPlus, Trash, MoreVertical, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks";
import { CreateGroupChatModal } from "@/components/messages/CreateGroupChatModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string;
    is_online: boolean;
  };
}

interface Chat {
  id: string;
  name?: string;
  type: 'dm' | 'group';
  last_message?: string;
  time?: string;
  user_id?: string;
  unread_count?: number;
  username?: string;
  avatar_url?: string;
}

export default function Messages() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatType, setActiveChatType] = useState<'dm' | 'group'>('dm');
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [chatType, setChatType] = useState<'recent' | 'groups' | 'dms'>('recent');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (user) {
      fetchChats();
      
      // Check if there's a user param in the URL
      const usernameParam = searchParams.get('user');
      if (usernameParam) {
        findAndOpenChat(usernameParam);
      }
    }
  }, [user, searchParams]);
  
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`messages:${activeChat}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${activeChat}` }, 
          (payload) => {
            setMessages(prevMessages => [...prevMessages, payload.new as Message]);
          })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeChat]);
  
  const fetchChats = async () => {
    setLoading(true);
    try {
      // Fetch direct messages
      const { data: directChats, error: dmError } = await supabase.rpc('get_user_direct_messages', {
        p_user_id: user?.id
      });
      
      if (dmError) throw dmError;
      
      // Fetch group chats
      const { data: groupChats, error: groupError } = await supabase.rpc('get_user_group_chats', {
        p_user_id: user?.id
      });
      
      if (groupError) throw groupError;

      const processedChats = [];
      
      // Process direct messages
      if (directChats && Array.isArray(directChats)) {
        for (const chat of directChats) {
          const isReceiver = chat.receiver_id === user?.id;
          const otherUserObj = isReceiver ? chat.sender : chat.receiver;
          const otherUser = typeof otherUserObj === 'string' 
            ? JSON.parse(otherUserObj) 
            : otherUserObj;
          
          processedChats.push({
            id: isReceiver ? chat.sender_id : chat.receiver_id,
            type: 'dm',
            last_message: chat.content,
            time: new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            username: otherUser?.username || 'Unknown',
            avatar_url: otherUser?.avatar_url || '',
            unread_count: isReceiver && !chat.read ? 1 : 0
          });
        }
      }
      
      // Process group chats
      if (groupChats && Array.isArray(groupChats)) {
        processedChats.push(...groupChats.map(chat => ({
          id: chat.id,
          name: chat.name,
          type: 'group',
          last_message: chat.last_message || "No messages yet",
          time: chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          unread_count: chat.unread_count || 0
        })));
      }
      
      setChats(processedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (chatId: string) => {
    try {
      let query;
      
      if (activeChatType === 'dm') {
        // For direct messages - fetch conversation between two users
        query = supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(username, avatar_url)
          `)
          .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user?.id})`)
          .order('created_at', { ascending: true });
      } else {
        // For group chats - fetch all messages for the group
        query = supabase
          .from('group_messages')
          .select(`
            *,
            sender:sender_id(username, avatar_url)
          `)
          .eq('group_id', chatId)
          .order('created_at', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setMessages(data || []);
      
      // Mark messages as read if they were sent to the current user
      if (activeChatType === 'dm') {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('sender_id', chatId)
          .eq('receiver_id', user?.id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;
    
    try {
      let newMessage;
      
      if (activeChatType === 'dm') {
        // Send direct message
        const { data, error } = await supabase
          .from('messages')
          .insert({
            content: message,
            sender_id: user?.id,
            receiver_id: activeChat,
          })
          .select()
          .single();
        
        if (error) throw error;
        newMessage = data;
      } else {
        // Send group message
        const { data, error } = await supabase
          .from('group_messages')
          .insert({
            content: message,
            sender_id: user?.id,
            group_id: activeChat,
          })
          .select()
          .single();
        
        if (error) throw error;
        newMessage = data;
      }

      // Update the messages state
      const messageWithSender = {
        ...newMessage,
        sender: {
          username: user?.user_metadata?.username || 'You',
          avatar_url: user?.user_metadata?.avatar_url
        }
      };
      
      setMessages(prev => [...prev, messageWithSender]);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };
  
  const startChat = async (userId: string, username: string, avatarUrl?: string) => {
    setActiveChat(userId);
    setActiveChatType('dm');
    setActiveChatUser({ username, avatar_url: avatarUrl });
    setSearchQuery("");
    setSearchResults([]);
    
    // Check if chat already exists in the list
    const existingChat = chats.find(chat => 
      chat.type === 'dm' && chat.id === userId
    );
    
    if (!existingChat) {
      // Add this user to the chats list
      setChats(prev => [
        {
          id: userId,
          type: 'dm',
          username,
          avatar_url: avatarUrl,
          last_message: 'New conversation',
          time: 'now',
          unread_count: 0
        },
        ...prev
      ]);
    }
    
    fetchMessages(userId);
  };
  
  const findAndOpenChat = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      
      if (data) {
        startChat(data.id, data.username, data.avatar_url);
      }
    } catch (error) {
      console.error('Error finding user:', error);
    }
  };
  
  const filteredChats = chatType === 'recent' 
    ? chats 
    : chatType === 'groups' 
      ? chats.filter(chat => chat.type === 'group')
      : chats.filter(chat => chat.type === 'dm');
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 pb-2">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender_id === user?.id;
          const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div 
              key={msg.id} 
              className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isCurrentUser && (
                  <div className="relative mr-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender?.avatar_url} />
                      <AvatarFallback>{(msg.sender?.username || '?')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {msg.sender?.is_online && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></span>
                    )}
                  </div>
                )}
                <div>
                  {!isCurrentUser && (
                    <p className="text-xs text-gray-400 mb-1">{msg.sender?.username}</p>
                  )}
                  <div 
                    className={`rounded-lg p-3 relative group ${
                      isCurrentUser 
                        ? 'bg-audifyx-purple text-white' 
                        : 'bg-audifyx-purple-dark/50 text-gray-100'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {time}
                    </p>
                    
                    {/* Delete option only available for own messages */}
                    {isCurrentUser && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-300">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-audifyx-purple-dark/90 border-audifyx-purple/30">
                            <DropdownMenuItem 
                              onClick={() => {
                                setMessageToDelete(msg.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-400 cursor-pointer flex items-center gap-2"
                            >
                              <Trash className="h-3 w-3" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
                {isCurrentUser && (
                  <div className="relative ml-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{(user?.user_metadata?.username || 'U')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };
  
  const deleteMessage = async () => {
    if (!messageToDelete) return;
    
    setIsDeleting(true);
    try {
      let deleteQuery;
      
      if (activeChatType === 'dm') {
        deleteQuery = supabase
          .from('messages')
          .delete()
          .eq('id', messageToDelete);
      } else {
        deleteQuery = supabase
          .from('group_messages')
          .delete()
          .eq('id', messageToDelete);
      }
      
      const { error } = await deleteQuery;
      
      if (error) throw error;
      
      // Remove the message from the state
      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      
      toast({
        description: "Message deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setMessageToDelete(null);
    }
  };
  
  const deleteConfirmationDialog = (
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="bg-audifyx-purple-dark/80 border-audifyx-purple/30">
        <DialogHeader>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this message? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={deleteMessage}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} flex h-screen`}>
          {/* Chat List */}
          <div className="w-80 border-r border-audifyx-purple/20 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Messages</h2>
              <div className="flex gap-2">
                <CreateGroupChatModal onSuccess={fetchChats} />
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search chats..." 
                className="pl-9 bg-background/10 border-audifyx-purple/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchQuery && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={handleSearch}
                >
                  <Search className="h-3 w-3" />
                </Button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="border border-audifyx-purple/20 rounded mb-4 bg-audifyx-purple-dark/30 overflow-hidden">
                <div className="p-2 bg-audifyx-purple/20 text-sm font-medium">Search Results</div>
                <div className="max-h-40 overflow-y-auto">
                  {searchResults.map(user => (
                    <div 
                      key={user.id} 
                      className="p-2 hover:bg-audifyx-purple/10 cursor-pointer flex items-center gap-2"
                      onClick={() => startChat(user.id, user.username, user.avatar_url)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t border-audifyx-purple/20">
                  <Button 
                    variant="link" 
                    className="text-xs text-audifyx-purple"
                    onClick={() => setSearchResults([])}
                  >
                    Clear results
                  </Button>
                </div>
              </div>
            )}

            <Tabs defaultValue="recent" className="w-full" onValueChange={(value) => setChatType(value as any)}>
              <TabsList className="w-full grid grid-cols-3 bg-audifyx-purple-dark/50">
                <TabsTrigger value="recent">All</TabsTrigger>
                <TabsTrigger value="dms">DMs</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2 mt-4 flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading chats...</div>
              ) : filteredChats.length > 0 ? (
                filteredChats.map(chat => (
                  <Card 
                    key={chat.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      activeChat === chat.id 
                        ? 'bg-audifyx-purple/30' 
                        : 'bg-background/10 hover:bg-audifyx-purple/20'
                    }`}
                    onClick={() => {
                      setActiveChat(chat.id);
                      setActiveChatType(chat.type);
                      if (chat.type === 'dm') {
                        setActiveChatUser({ username: chat.username, avatar_url: chat.avatar_url });
                      }
                      fetchMessages(chat.id);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {chat.type === 'group' ? (
                        <div className="w-12 h-12 rounded-full bg-audifyx-purple/30 flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                      ) : (
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={chat.avatar_url} />
                          <AvatarFallback>{(chat.username || '?')[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="font-semibold truncate">{chat.name || chat.username}</p>
                          {chat.time && <span className="text-xs text-gray-400">{chat.time}</span>}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-400 truncate">{chat.last_message}</p>
                          {chat.unread_count > 0 && (
                            <div className="bg-audifyx-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                              {chat.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No {chatType === 'groups' ? 'group chats' : chatType === 'dms' ? 'direct messages' : 'chats'} found
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {activeChat ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-audifyx-purple/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {activeChatType === 'group' ? (
                    <div className="w-10 h-10 rounded-full bg-audifyx-purple/30 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activeChatUser?.avatar_url} />
                      <AvatarFallback>{(activeChatUser?.username || '?')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {activeChatType === 'group' 
                        ? chats.find(c => c.id === activeChat && c.type === 'group')?.name 
                        : activeChatUser?.username}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {activeChatType === 'group' ? 'Group Chat' : 'Direct Message'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeChatType === 'group' && (
                    <Button size="icon" variant="ghost">
                      <UserPlus className="w-5 h-5" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Video className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-audifyx-charcoal/10">
                {renderMessages()}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-audifyx-purple/20">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-background/10 border-audifyx-purple/30"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} disabled={!message.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </main>
      </div>
      {deleteConfirmationDialog}
    </div>
  );
}
