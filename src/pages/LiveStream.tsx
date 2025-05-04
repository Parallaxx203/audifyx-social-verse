
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwitchIntegrationPanel } from "@/components/profile/TwitchIntegrationPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { LiveStreamChat } from "@/components/live-stream/LiveStreamChat";

export default function LiveStream() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [streamers, setStreamers] = useState<any[]>([]);
  const [selectedStreamer, setSelectedStreamer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreamers();
    }
  }, [user]);

  const fetchStreamers = async () => {
    try {
      const { data, error } = await supabase
        .from("twitch_connections")
        .select("*, profiles(*)");

      if (error) throw error;
      
      setStreamers(data || []);
      if (data && data.length > 0) {
        setSelectedStreamer(data[0]);
      }
    } catch (error) {
      console.error("Error fetching streamers:", error);
      toast({
        title: "Error",
        description: "Failed to load streamers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? "ml-0" : "ml-64"} p-6`}>
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Live Stream</h1>
                <p className="text-gray-400">Watch live streams from your favorite creators</p>
              </div>
              {user && (
                <TwitchIntegrationPanel />
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <p className="text-gray-400">Loading streamers...</p>
              </div>
            ) : streamers.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-xl font-bold mb-2">No Live Streamers Yet</h2>
                <p className="text-gray-400 mb-4">Connect your Twitch account to be the first streamer!</p>
                <TwitchIntegrationPanel />
              </div>
            ) : (
              <>
                {/* Streamer selection */}
                <div className="overflow-x-auto pb-2">
                  <div className="flex space-x-4 min-w-max">
                    {streamers.map((streamer) => (
                      <div
                        key={streamer.id}
                        className={`cursor-pointer transition-all ${
                          selectedStreamer?.id === streamer.id
                            ? "scale-105"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setSelectedStreamer(streamer)}
                      >
                        <div
                          className={`w-16 h-16 rounded-full p-1 ${
                            selectedStreamer?.id === streamer.id
                              ? "bg-gradient-to-r from-audifyx-purple to-audifyx-blue"
                              : "bg-audifyx-purple/30"
                          }`}
                        >
                          <Avatar className="w-full h-full">
                            <AvatarImage src={streamer.profiles?.avatar_url} />
                            <AvatarFallback>
                              {streamer.profiles?.username?.[0]?.toUpperCase() || "S"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <p className="text-xs text-center mt-1 truncate w-16">
                          {streamer.profiles?.username || streamer.twitch_username}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main stream display */}
                {selectedStreamer && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 overflow-hidden">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedStreamer.profiles?.avatar_url} />
                              <AvatarFallback>
                                {selectedStreamer.profiles?.username?.[0]?.toUpperCase() || "S"}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {selectedStreamer.profiles?.username || selectedStreamer.twitch_username}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 aspect-video">
                          <iframe
                            src={`https://player.twitch.tv/?channel=${selectedStreamer.twitch_username}&parent=${window.location.hostname}`}
                            height="100%"
                            width="100%"
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen={true}
                            scrolling="no"
                            title={`${selectedStreamer.twitch_username}'s stream`}
                          ></iframe>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-1">
                      <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 h-full flex flex-col">
                        <CardHeader>
                          <CardTitle>Live Chat</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col overflow-hidden">
                          <LiveStreamChat streamer={selectedStreamer} />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
