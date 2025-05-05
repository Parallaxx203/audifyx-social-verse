
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Loader2 } from "lucide-react";
import { usePointsSystem } from "@/hooks/usePointsSystem";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LiveStreamChat } from "@/components/live-stream/LiveStreamChat";

export default function LiveStreaming() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addStreamViewPoints } = usePointsSystem();
  const [streamers, setStreamers] = useState<any[]>([]);
  const [selectedStreamer, setSelectedStreamer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchStreamers();
  }, []);

  const fetchStreamers = async () => {
    try {
      const { data, error } = await supabase
        .from("active_streams")
        .select("*, profiles(username, avatar_url)");

      if (error) throw error;
      
      setStreamers(data || []);
      if (data && data.length > 0) {
        setSelectedStreamer(data[0]);
        if (user && user.id !== data[0].user_id) {
          addStreamViewPoints(data[0].user_id);
        }
      }
    } catch (error) {
      console.error("Error fetching streamers:", error);
      toast({
        title: "Error",
        description: "Failed to load active streamers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamSelect = async (streamer: any) => {
    setSelectedStreamer(streamer);
    if (user && user.id !== streamer.user_id) {
      await addStreamViewPoints(streamer.user_id);
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
                <h1 className="text-3xl font-bold">Live Streaming</h1>
                <p className="text-gray-400">Watch live streams from your favorite creators</p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-audifyx-purple" />
                <div className="text-white text-xl">Loading streamers...</div>
              </div>
            ) : streamers.length === 0 ? (
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <CardContent className="text-center py-20">
                  <h2 className="text-xl font-bold mb-2">No Live Streamers Available</h2>
                  <p className="text-gray-400 mb-4">Check back later for live content!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Mac-style stream display */}
                <div className="mac-frame mx-auto">
                  {selectedStreamer && (
                    <div className="mac-screen">
                      <iframe
                        src={`${selectedStreamer.stream_url}?parent=${window.location.hostname}`}
                        title={`${selectedStreamer.profiles?.username}'s Stream`}
                        className="w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
                
                {/* Stream tabs */}
                <div className="stream-tab-list mt-4">
                  {streamers.map((streamer) => (
                    <Button
                      key={streamer.id}
                      className={`flex items-center gap-2 ${
                        selectedStreamer?.id === streamer.id
                          ? "bg-audifyx-purple"
                          : "bg-audifyx-purple-dark/50 hover:bg-audifyx-purple-dark/80"
                      }`}
                      onClick={() => handleStreamSelect(streamer)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={streamer.profiles?.avatar_url} />
                        <AvatarFallback>
                          {streamer.profiles?.username?.[0]?.toUpperCase() || "S"}
                        </AvatarFallback>
                      </Avatar>
                      {streamer.profiles?.username || "Streamer"}
                    </Button>
                  ))}
                </div>
                
                {/* Chat button for mobile */}
                {isMobile && selectedStreamer && (
                  <div className="fixed bottom-20 right-6">
                    <Button
                      className="rounded-full h-14 w-14 bg-audifyx-purple shadow-lg"
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageSquare className="h-6 w-6" />
                    </Button>
                  </div>
                )}
                
                {/* Chat panel for desktop */}
                {!isMobile && selectedStreamer && (
                  <Card className="mt-4 bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                    <CardHeader>
                      <CardTitle>Live Chat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LiveStreamChat streamer={selectedStreamer} />
                    </CardContent>
                  </Card>
                )}
                
                {/* Mobile chat dialog */}
                <Dialog open={chatOpen && isMobile} onOpenChange={setChatOpen}>
                  <DialogContent className="sm:max-w-md h-[80vh]">
                    <div className="flex-1 overflow-hidden h-full">
                      {selectedStreamer && <LiveStreamChat streamer={selectedStreamer} />}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .mac-frame {
          background: url('/mac_screen_frame.png') no-repeat center center;
          background-size: contain;
          width: 100%;
          max-width: 800px;
          aspect-ratio: 16 / 10;
          position: relative;
        }
        
        .mac-screen {
          position: absolute;
          top: 5%;
          left: 5%;
          width: 90%;
          height: 85%;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .stream-tab-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
