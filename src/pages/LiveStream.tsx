
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, Users, Play, Share, ExternalLink } from "lucide-react";
import { useTwitchStatus, useTwitchConnection } from "@/hooks/useTwitchConnection";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { TwitchEmbed } from "@/components/twitch/TwitchEmbed";

export default function LiveStream() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [twitchUsername, setTwitchUsername] = useState("");
  const [openConnectDialog, setOpenConnectDialog] = useState(false);
  
  useEffect(() => {
    const userInfo = localStorage.getItem("audifyx-user");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);
  
  // Twitch connection hooks
  const { twitchConnection, isLoading: isTwitchStatusLoading, fetchTwitchConnection } = useTwitchStatus(user?.id || "");
  const { connectTwitch, disconnectTwitch, isConnecting } = useTwitchConnection(user?.id || "");

  const handleTwitchConnect = async () => {
    try {
      await connectTwitch(twitchUsername);
      setTwitchUsername("");
      fetchTwitchConnection();
      setOpenConnectDialog(false);
      toast({
        title: "Success",
        description: "Twitch account connected successfully"
      });
    } catch (error) {
      console.error("Error connecting Twitch:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTwitchConnection();
    }
  }, [user?.id]);

  // Mock livestreams data
  const mockLivestreams = [
    {
      id: 1,
      username: "BassKing42",
      title: "Mixing new tracks live - come join!",
      viewerCount: 387,
      thumbnailUrl: "https://placehold.co/600x400/252525/8a2be2?text=BassKing42+Live",
      platform: "Twitch"
    },
    {
      id: 2,
      username: "MelodyMaster",
      title: "Piano improvisation & chill beats",
      viewerCount: 216,
      thumbnailUrl: "https://placehold.co/600x400/252525/1EAEDB?text=MelodyMaster+Live",
      platform: "YouTube"
    },
    {
      id: 3,
      username: "VocalQueen",
      title: "Vocal practice & covers - taking requests",
      viewerCount: 158,
      thumbnailUrl: "https://placehold.co/600x400/252525/9b87f5?text=VocalQueen+Live",
      platform: "Twitch"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4 md:p-8`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Radio className="w-6 h-6 text-audifyx-purple" /> Live Streams
                </h1>
                <p className="text-gray-300 mt-1">
                  Watch and interact with creators streaming live music
                </p>
              </div>
              
              {user?.accountType === "creator" && (
                <>
                  {twitchConnection ? (
                    <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                      <span className="text-sm text-audifyx-purple mb-2">
                        Connected as: <strong>{twitchConnection.twitch_username}</strong>
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          className="bg-audifyx-purple"
                          onClick={() => window.open(`https://twitch.tv/${twitchConnection.twitch_username}`, '_blank')}
                        >
                          Go Live <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => disconnectTwitch()}
                          className="border-audifyx-purple/30"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Dialog open={openConnectDialog} onOpenChange={setOpenConnectDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="mt-4 md:mt-0 bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                        >
                          Connect Twitch
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-audifyx-purple-dark/90 border-audifyx-purple/30">
                        <DialogHeader>
                          <DialogTitle>Connect to Twitch</DialogTitle>
                          <DialogDescription>
                            Link your Twitch account to start streaming live on Audifyx
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <label className="text-sm font-medium mb-2 block">
                            Twitch Username
                          </label>
                          <Input
                            placeholder="YourTwitchUsername"
                            value={twitchUsername}
                            onChange={(e) => setTwitchUsername(e.target.value)}
                            className="bg-background/10 border-audifyx-purple/30"
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Enter your Twitch username to connect your account
                          </p>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setOpenConnectDialog(false)}
                            className="border-audifyx-purple/30"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleTwitchConnect}
                            disabled={!twitchUsername.trim() || isConnecting}
                            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                          >
                            {isConnecting ? "Connecting..." : "Connect"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>
            
            {twitchConnection && user?.accountType === "creator" && (
              <Card className="mb-8 border-audifyx-purple/20 bg-gradient-to-br from-audifyx-purple/20 to-audifyx-blue/20">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          Your Twitch Stream
                        </h2>
                        <p className="text-gray-300">
                          Stream your music and connect with your audience
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={`https://twitch.tv/${twitchConnection.twitch_username}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-audifyx-purple hover:underline"
                        >
                          twitch.tv/{twitchConnection.twitch_username} <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    <div className="w-full">
                      <TwitchEmbed channel={twitchConnection.twitch_username} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!twitchConnection && user?.accountType === "creator" && (
              <Card className="mb-8 border-audifyx-purple/20 bg-gradient-to-br from-audifyx-purple/20 to-audifyx-blue/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Start Streaming</h2>
                      <p className="text-gray-300">
                        Connect your Twitch account to start sharing your music live
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                          Connect Twitch
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-audifyx-purple-dark/90 border-audifyx-purple/30">
                        <DialogHeader>
                          <DialogTitle>Connect to Twitch</DialogTitle>
                          <DialogDescription>
                            Link your Twitch account to start streaming live on Audifyx
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <label className="text-sm font-medium mb-2 block">
                            Twitch Username
                          </label>
                          <Input
                            placeholder="YourTwitchUsername"
                            value={twitchUsername}
                            onChange={(e) => setTwitchUsername(e.target.value)}
                            className="bg-background/10 border-audifyx-purple/30"
                          />
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setOpenConnectDialog(false)}
                            className="border-audifyx-purple/30"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleTwitchConnect}
                            disabled={!twitchUsername.trim() || isConnecting}
                            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                          >
                            {isConnecting ? "Connecting..." : "Connect"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Featured Streams
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {mockLivestreams.map((stream) => (
                <Card 
                  key={stream.id} 
                  className="overflow-hidden border-audifyx-purple/20 bg-audifyx-purple-dark/30 hover:shadow-lg hover:shadow-audifyx-purple/10 transition-all duration-300"
                >
                  <div className="relative">
                    <img 
                      src={stream.thumbnailUrl} 
                      alt={stream.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                      <Users className="w-3 h-3 mr-1" /> {stream.viewerCount}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {stream.platform}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity duration-300">
                      <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                        <Play className="mr-2 h-4 w-4" /> Watch Stream
                      </Button>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-bold mb-1 truncate">{stream.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">@{stream.username}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center py-4">
              <p className="text-gray-400 mb-2">Don't see the content you're looking for?</p>
              <Link to="/settings">
                <Button variant="link" className="text-audifyx-purple">
                  Connect your streaming accounts in Settings
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
