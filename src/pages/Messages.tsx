
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserList } from "@/components/users/UserList";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string;
  }
}

interface ChatGroup {
  id: string;
  name: string;
  created_at: string;
}

export default function Messages() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        loadGroups(user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadDirectMessages(selectedUser.id);
    } else if (selectedGroup) {
      loadGroupMessages(selectedGroup.id);
    }
  }, [selectedUser, selectedGroup]);

  const loadDirectMessages = async (recipientId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.eq.${recipientId},receiver_id.eq.${recipientId}`)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
      return;
    }

    setMessages(data || []);
  };

  const loadGroupMessages = async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        sender:profiles!sender_id(username, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load group messages",
        variant: "destructive"
      });
      return;
    }

    setMessages(data || []);
  };

  const loadGroups = async (userId: string) => {
    const { data, error } = await supabase
      .from('chat_groups')
      .select('*')
      .contains('member_ids', [userId]);

    if (!error && data) {
      setGroups(data);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const table = selectedGroup ? 'group_messages' : 'messages';
    const messageData = selectedGroup 
      ? {
          content: message,
          sender_id: userId,
          group_id: selectedGroup.id
        }
      : {
          content: message,
          sender_id: userId,
          receiver_id: selectedUser.id
        };

    const { error } = await supabase
      .from(table)
      .insert([messageData]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return;
    }

    setMessage("");
    if (selectedGroup) {
      loadGroupMessages(selectedGroup.id);
    } else {
      loadDirectMessages(selectedUser.id);
    }
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
      <Card className="col-span-4 p-4">
        <Tabs defaultValue="direct">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="direct" className="flex-1">Direct Messages</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct">
            <UserList onSelectUser={(user) => {
              setSelectedUser(user);
              setSelectedGroup(null);
            }} />
          </TabsContent>
          
          <TabsContent value="groups">
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => {/* Implement group creation */}}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Group
              </Button>
              {groups.map(group => (
                <div
                  key={group.id}
                  className="p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => {
                    setSelectedGroup(group);
                    setSelectedUser(null);
                  }}
                >
                  {group.name}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      <Card className="col-span-8 p-4 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`mb-4 flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${msg.sender_id === userId ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                <Avatar className="w-8 h-8" />
                <div className={`px-4 py-2 rounded-lg ${
                  msg.sender_id === userId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!selectedUser && !selectedGroup}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button 
            disabled={!selectedUser && !selectedGroup || !message.trim()} 
            onClick={sendMessage}
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
