import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Users, Plus, Send, Phone, Video } from "lucide-react";

export default function Messages() {
  const isMobile = useIsMobile();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Mock data for chats
  const chats = [
    { id: "1", name: "Music Producers", type: "group", lastMessage: "Great beat!", time: "2m ago" },
    { id: "2", name: "John Doe", type: "dm", lastMessage: "When is your next track dropping?", time: "1h ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} flex h-screen`}>
          {/* Chat List */}
          <div className="w-80 border-r border-audifyx-purple/20 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Messages</h2>
              <Button size="icon" variant="ghost">
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search chats..." 
                className="pl-9 bg-background/10 border-audifyx-purple/30"
              />
            </div>

            <div className="space-y-2">
              {chats.map(chat => (
                <Card 
                  key={chat.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    activeChat === chat.id 
                      ? 'bg-audifyx-purple/30' 
                      : 'bg-background/10 hover:bg-audifyx-purple/20'
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    {chat.type === 'group' ? (
                      <div className="w-12 h-12 rounded-full bg-audifyx-purple/30 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-audifyx-blue/30" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold truncate">{chat.name}</p>
                        <span className="text-xs text-gray-400">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {activeChat ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-audifyx-purple/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-audifyx-purple/30" />
                  <h3 className="font-semibold">
                    {chats.find(c => c.id === activeChat)?.name}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Video className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Mock messages would go here */}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-audifyx-purple/20">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-background/10 border-audifyx-purple/30"
                  />
                  <Button>
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
    </div>
  );
}