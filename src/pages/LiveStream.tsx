
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Twitch } from "lucide-react";
import { useTwitchConnection, useTwitchStatus } from "@/hooks/useTwitchConnection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LiveStream() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [isTwitchModalOpen, setIsTwitchModalOpen] = useState(false);
  const [twitchUsername, setTwitchUsername] = useState('');

  useEffect(() => {
    const userInfo = localStorage.getItem("audifyx-user");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const { connectTwitch, isConnecting } = useTwitchConnection(user?.id);
  const { twitchConnection, isLoading, fetchTwitchConnection } = useTwitchStatus(user?.id);

  useEffect(() => {
    if (user?.id) {
      fetchTwitchConnection();
    }
  }, [user?.id]);

  const handleConnectTwitch = async () => {
    await connectTwitch(twitchUsername);
    setIsTwitchModalOpen(false);
    fetchTwitchConnection();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8 px-4`}>
          <div className="max-w-3xl mx-auto py-8">
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
              <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                Go Live
              </Button>
            </div>
            
            <div className="bg-audifyx-purple-dark/70 rounded-xl p-8 text-center">
              <p className="text-gray-300">
                {twitchConnection 
                  ? "Your Twitch stream will be displayed here." 
                  : "Connect your Twitch account to see your live streams."}
              </p>
            </div>
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
                  onClick={() => {
                    // TODO: Implement disconnect logic
                    setIsTwitchModalOpen(false);
                  }}
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
