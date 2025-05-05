
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePointsSystem } from "@/hooks/usePointsSystem";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Radio, Users } from "lucide-react";

interface Stream {
  id: string;
  user_id: string;
  username: string;
  stream_url: string;
  started_at: string;
}

export default function LiveStreaming() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { addStreamViewPoints } = usePointsSystem();
  const [activeStreams, setActiveStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);

  useEffect(() => {
    fetchActiveStreams();
  }, []);

  const fetchActiveStreams = async () => {
    setLoading(true);
    try {
      // In a real implementation, fetch active streams from the database
      // For now, just set an empty array
      setActiveStreams([]);
    } catch (error) {
      console.error("Error fetching active streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStreamSelect = async (stream: Stream) => {
    setCurrentStream(stream);
    
    // Add points to streamer if it's not the current user
    if (user && user.id !== stream.user_id) {
      await addStreamViewPoints(stream.user_id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Live Streams</h1>
            <p className="text-gray-300 mb-6">Watch and interact with live creators.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20 mb-6">
                  <CardContent className="p-0">
                    <div className="stream-section">
                      <div className="mac-frame">
                        {currentStream ? (
                          <video id="mainStream" autoPlay controls>
                            <source src={currentStream.stream_url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="video-placeholder flex items-center justify-center">
                            <div className="text-center">
                              <Radio className="h-12 w-12 mx-auto mb-4 text-audifyx-purple animate-pulse" />
                              <h3 className="text-xl font-bold mb-2">No stream selected</h3>
                              <p className="text-gray-400">Select a live stream to start watching</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {currentStream && (
                        <div className="stream-info p-4">
                          <h2 className="text-xl font-bold">{currentStream.username}'s Stream</h2>
                          <p className="text-gray-400 text-sm">
                            Live now • {new Date(currentStream.started_at).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="stream-tab-list mb-6" id="streamTabs">
                  {loading ? (
                    <div className="flex items-center justify-center w-full py-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading streams...</span>
                    </div>
                  ) : activeStreams.length > 0 ? (
                    activeStreams.map((stream) => (
                      <Button
                        key={stream.id}
                        variant={currentStream?.id === stream.id ? "default" : "outline"}
                        className={`mb-2 mr-2 ${
                          currentStream?.id === stream.id
                            ? "bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                            : ""
                        }`}
                        onClick={() => handleStreamSelect(stream)}
                      >
                        {stream.username}
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      No active streams available
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Live Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : activeStreams.length > 0 ? (
                      <div className="space-y-4">
                        {activeStreams.map((stream) => (
                          <div
                            key={stream.id}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              currentStream?.id === stream.id
                                ? "bg-audifyx-purple/30"
                                : "hover:bg-audifyx-purple/20"
                            }`}
                            onClick={() => handleStreamSelect(stream)}
                          >
                            <div className="font-medium">{stream.username}</div>
                            <div className="flex items-center mt-1">
                              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                              <span className="text-xs text-gray-400">Live</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <p>No live creators at the moment</p>
                        <p className="text-sm mt-2">Check back soon!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="mt-6 text-sm text-gray-400">
                  <p className="font-medium text-white mb-1">About Points</p>
                  <p>Creators earn 4.5 points each time someone views their stream. These points can be converted to real earnings through the payout system.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <style jsx>{`
        .stream-section {
          position: relative;
          width: 100%;
        }
        .mac-frame {
          background: url('/mac_screen_frame.png') no-repeat center center;
          background-size: contain;
          width: 100%;
          aspect-ratio: 16/10;
          position: relative;
          margin: auto;
        }
        .mac-frame video,
        .video-placeholder {
          width: 94%;
          height: 94%;
          position: absolute;
          top: 3%;
          left: 3%;
          border-radius: 8px;
          background-color: #141414;
          overflow: hidden;
        }
        .stream-tab-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
