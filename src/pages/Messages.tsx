
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserList } from "@/components/users/UserList";

export default function Messages() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  return (
    <div className="container mx-auto p-4 grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
      <Card className="col-span-4 p-4">
        <UserList onSelectUser={setSelectedUser} />
      </Card>
      
      <Card className="col-span-8 p-4 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          {selectedUser ? (
            <div className="space-y-4">
              {/* Messages will be populated here */}
              <p className="text-center text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Select a user to start messaging</p>
          )}
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!selectedUser}
          />
          <Button disabled={!selectedUser || !message}>Send</Button>
        </div>
      </Card>
    </div>
  );
}
