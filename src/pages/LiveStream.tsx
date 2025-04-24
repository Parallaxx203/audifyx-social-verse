
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Twitch, Users } from "lucide-react";
import { useTwitchConnection, useTwitchStatus } from "@/hooks/useTwitchConnection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export default function LiveStream() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [isTwitchModalOpen, setIsTwitchModalOpen] = useState(false);
  const [twitchUsername, setTwitchUsername] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("audifyx-user");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const { connectTwitch, disconnectTwitch, isConnecting } = useTwitchConnection(user?.id);
  const { twitchConnection, isLoading, fetchTwitchConnection } = useTwitchStatus(user?.id);

  useEffect(() => {
    if (user?.id) {
      fetchTwitchConnection();
    }
  }, [user?.id, fetchTwitchConnection]);

  const handleConnectTwitch = async () => {
    const result = await connectTwitch(twitchUsername);
    if (result) {
      setIsTwitchModalOpen(false);
      fetchTwitchConnection();
    }
  };
  
  const handleDisconnectTwitch = async () => {
    await disconnectTwitch();
    setIsTwitchModalOpen(false);
    fetchTwitchConnection();
  };
  
  const handleGoLive = () => {
    if (!twitchConnection) {
      toast({
        title: "Twitch Not Connected",
        description: "Please connect your Twitch account first.",
        variant: "destructive"
      });
      setIsTwitchModalOpen(true);
      return;
    }
    
    setIsLiveStreaming(!isLiveStreaming);
    toast({
      title: isLiveStreaming ? "Stream Ended" : "Going Live",
      description: isLiveStreaming 
        ? "Your stream has ended" 
        : "You are now live streaming! Connect to your Twitch account to start broadcasting."
    });
  };

  if (!user) return null;

  const renderTwitchEmbed = () => {
    if (!twitchConnection) {
      return (
        <div className="bg-audifyx-purple-dark/70 rounded-xl p-8 text-center">
          <p className="text-gray-300 mb-4">
            Connect your Twitch account to see your live streams.
          </p>
          <Button 
            variant="outline" 
            className="border-audifyx-purple/30 hover:bg-audifyx-purple/20"
            onClick={() => setIsTwitchModalOpen(true)}
          >
            <Twitch className="mr-2 h-4 w-4" /> Connect Twitch
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-audifyx-purple-dark/70 rounded-xl overflow-hidden">
          <div className="aspect-video w-full">
            {isLiveStreaming ? (
              <div className="relative w-full h-full">
                <iframe
                  src={`https://player.twitch.tv/?channel=${twitchConnection.twitch_username}&parent=${window.location.hostname}`}
                  allowFullScreen
                  className="w-full h-full"
                  title="Twitch Stream"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-audifyx-purple-dark to-black">
                <div className="text-center p-6">
                  <Twitch className="h-12 w-12 mx-auto mb-4 text-audifyx-purple" />
                  <h3 className="text-xl font-bold mb-2">Ready to Stream</h3>
                  <p className="text-gray-400">
                    Click "Go Live" to start your stream on Twitch as {twitchConnection.twitch_username}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg">Your Stream</h3>
            <p className="text-gray-400 text-sm">
              {isLiveStreaming 
                ? "You are currently live streaming to Twitch" 
                : "Start your stream on Twitch to go live"
              }
            </p>
          </div>
        </div>
        
        <div className="bg-audifyx-purple-dark/50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-audifyx-purple" />
              <span className="font-medium">Viewers: {isLiveStreaming ? "Loading..." : "0"}</span>
            </div>
            <Button 
              onClick={handleGoLive}
              className={isLiveStreaming ? "bg-red-500 hover:bg-red-600" : "bg-audifyx-purple hover:bg-audifyx-purple-vivid"}
            >
              {isLiveStreaming ? "End Stream" : "Go Live"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8 px-4`}>
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Video className="w-6 h-6"/> Watch Creators Live Now
            </h1>
            <div className="mb-6 flex items-center gap-4">
              {!twitchConnection ? (
                <Button 
                  variant="outline" 
                  className="border-audifyx-purple/30 hover:bg-audifyx-purple/20"
                  onClick={() => setIsTwitchModalOpen(true)}
                >
                  <Twitch className="mr-2 h-4 w-4" /> Connect Twitch
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Twitch className="h-6 w-6 text-purple-500" />
                  <span>Twitch: {twitchConnection.twitch_username}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
                    onClick={() => setIsTwitchModalOpen(true)}
                  >
                    Disconnect
                  </Button>
                </div>
              )}
              <Button 
                className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                onClick={handleGoLive}
              >
                {isLiveStreaming ? "End Stream" : "Go Live"}
              </Button>
            </div>
            
            {renderTwitchEmbed()}
          </div>
        </main>
      </div>

      <Dialog open={isTwitchModalOpen} onOpenChange={setIsTwitchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {twitchConnection ? "Disconnect Twitch" : "Connect Twitch"}
            </DialogTitle>
          </DialogHeader>
          {twitchConnection ? (
            <div>
              <p>Are you sure you want to disconnect your Twitch account?</p>
              <div className="flex justify-end gap-4 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTwitchModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDisconnectTwitch}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input 
                placeholder="Enter Twitch Username" 
                value={twitchUsername}
                onChange={(e) => setTwitchUsername(e.target.value)}
              />
              <Button 
                onClick={handleConnectTwitch} 
                disabled={!twitchUsername || isConnecting}
                className="w-full"
              >
                {isConnecting ? "Connecting..." : "Connect Twitch"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
