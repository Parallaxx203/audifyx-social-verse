import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { UserList } from "@/components/users/UserList";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Settings, Image as ImageIcon, Paperclip, Smile, Send } from "lucide-react";

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

export default function Messages() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const { error } = await supabase
      .from('messages')
      .insert([{
        content: message,
        sender_id: userId,
        receiver_id: selectedUser.id
      }]);

    if (!error) {
      setMessage("");
      // Refresh messages -  Consider adding a function to reload messages here.
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <Card className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages" className="pl-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <UserList onSelectUser={setSelectedUser} />
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center gap-3">
              <Avatar>
                <Avatar.Image src={selectedUser.avatar_url} alt={selectedUser.username} />
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedUser.username}</h3>
                <span className="text-sm text-muted-foreground">Active now</span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex mb-4 ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${msg.sender_id === userId ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <Avatar.Image src={msg.sender?.avatar_url} alt={msg.sender?.username} />
                    </Avatar>
                    <div className={`rounded-lg p-3 ${
                      msg.sender_id === userId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button onClick={sendMessage} disabled={!message.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}