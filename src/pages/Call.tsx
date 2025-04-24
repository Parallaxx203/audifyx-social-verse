
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserList } from "@/components/users/UserList";
import { Phone, PhoneOff, Video, VideoOff } from "lucide-react";

export default function Call() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  return (
    <div className="container mx-auto p-4 grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
      <Card className="col-span-4 p-4">
        <UserList onSelectUser={setSelectedUser} />
      </Card>
      
      <Card className="col-span-8 p-4 flex flex-col items-center justify-center">
        {selectedUser ? (
          <>
            <div className="aspect-video w-full bg-black/10 rounded-lg mb-4 flex items-center justify-center">
              {isInCall ? "Call in progress" : "Ready to call"}
            </div>
            
            <div className="flex gap-4">
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="icon"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              >
                {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>
              
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="icon"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              >
                {isAudioEnabled ? <Phone /> : <PhoneOff />}
              </Button>
              
              <Button
                variant={isInCall ? "destructive" : "default"}
                onClick={() => setIsInCall(!isInCall)}
              >
                {isInCall ? "End Call" : "Start Call"}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">Select a user to start a call</p>
        )}
      </Card>
    </div>
  );
}
