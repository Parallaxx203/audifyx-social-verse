
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TwitchIntegrationPanel } from "@/components/profile/TwitchIntegrationPanel";
import { TwitchEmbed } from "@/components/twitch/TwitchEmbed";
import { useTwitchStatus } from "@/hooks/useTwitchConnection";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TwitchUser {
  id: string;
  username: string;
  avatar_url: string;
  twitch_username: string;
}

export default function LiveStream() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const accountType = user?.user_metadata?.accountType || 'listener';
  const { twitchConnection, isLoading, fetchTwitchConnection } = useTwitchStatus(user?.id || '');
  const [twitchUsers, setTwitchUsers] = useState<TwitchUser[]>([]);
  const [selectedStreamer, setSelectedStreamer] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Fetch all users with Twitch connections
  useEffect(() => {
    const fetchTwitchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('twitch_connections')
          .select(`
            id,
            twitch_username,
            user_id,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq('twitch_username', 'is', 'not.null');
        
        if (error) throw error;
        
        if (data) {
          const formattedUsers = data.map(item => ({
            id: item.user_id,
            username: item.profiles?.username || 'Unknown User',
            avatar_url: item.profiles?.avatar_url || '',
            twitch_username: item.twitch_username
          }));
          
          setTwitchUsers(formattedUsers);
          
          // Set default selected streamer if available
          if (formattedUsers.length > 0 && !selectedStreamer) {
            setSelectedStreamer(formattedUsers[0].twitch_username);
          }
        }
      } catch (err) {
        console.error("Error fetching Twitch users:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchTwitchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Live Stream</h1>
            
            {/* Display integration panel for creators */}
            {accountType === 'creator' && (
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 mb-6">
                <CardHeader>
                  <CardTitle>Your Streaming Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  {!twitchConnection ? (
                    <>
                      <p className="mb-6">Connect your Twitch account to start streaming on Audifyx.</p>
                      <TwitchIntegrationPanel />
                    </>
                  ) : (
                    <>
                      <div className="mb-6">
                        <p className="text-green-500 font-medium mb-2">✓ Connected to Twitch as <span className="font-bold">{twitchConnection.twitch_username}</span></p>
                        <p>Your Twitch stream is now available to all Audifyx users!</p>
                      </div>
                      
                      <div className="mt-8 bg-audifyx-purple-dark/30 p-6 rounded-lg border border-audifyx-purple/20">
                        <h3 className="text-xl font-bold mb-4">Your Stream Preview</h3>
                        
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <TwitchEmbed channel={twitchConnection.twitch_username} />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Streamers list */}
            <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 mb-6">
              <CardHeader>
                <CardTitle>Featured Streamers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-audifyx-purple"></div>
                  </div>
                ) : twitchUsers.length === 0 ? (
                  <p className="text-center py-4 text-gray-400">No streamers are currently connected. Be the first to connect your Twitch account!</p>
                ) : (
                  <ScrollArea className="w-full whitespace-nowrap mb-6 py-2">
                    <div className="flex space-x-4 pb-2">
                      {twitchUsers.map(streamer => (
                        <div 
                          key={streamer.id}
                          className={`flex-shrink-0 cursor-pointer transition-all hover:scale-105 ${
                            selectedStreamer === streamer.twitch_username ? 'ring-2 ring-audifyx-purple-vivid' : ''
                          }`}
                          onClick={() => setSelectedStreamer(streamer.twitch_username)}
                        >
                          <div className="w-24 flex flex-col items-center">
                            <Avatar className="w-16 h-16 mb-2">
                              <AvatarImage src={streamer.avatar_url || ""} />
                              <AvatarFallback>{streamer.username?.[0]?.toUpperCase() || "S"}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm truncate max-w-full">{streamer.username}</p>
                            <span className="text-xs text-red-400 flex items-center">
                              <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                              LIVE
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                
                {/* Stream display */}
                {selectedStreamer && (
                  <div className="aspect-video">
                    <TwitchEmbed channel={selectedStreamer} height="100%" />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* If no streamers, show demo/sample streamers */}
            {!isLoadingUsers && twitchUsers.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['moonjumpgames', 'shroud', 'pokimane'].map(streamer => (
                  <Card key={streamer} className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
                    <div className="aspect-video relative">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center">
                          <div className="text-xl font-medium">@{streamer}</div>
                          <Button variant="secondary" size="sm" className="mt-2">
                            View Stream
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-audifyx-purple"></div>
                          <div className="text-sm font-medium">{streamer}</div>
                        </div>
                        <div className="flex items-center text-xs text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                          LIVE
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
      <style>
        {`
        .marquee {
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        `}
      </style>
    </div>
  );
}
