
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks";
import { Music, Play, Trash } from "lucide-react";
import { UploadTrackModal } from "@/components/creator/UploadTrackModal";

interface Track {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  track_url: string;
  created_at: string;
  play_count: number;
}

export default function MyTracks() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user) {
      fetchTracks();
    }
  }, [user]);

  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      toast({
        title: "Error",
        description: "Could not load your tracks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (trackId: string, trackUrl: string) => {
    // Stop current track if any
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
      setAudioElement(null);
    } else {
      const audio = new Audio(trackUrl);
      audio.play().catch(error => {
        console.error("Failed to play audio:", error);
        toast({
          title: "Playback Error",
          description: "Could not play this track",
          variant: "destructive"
        });
      });
      setAudioElement(audio);
      setCurrentlyPlaying(trackId);
      
      // Increment play count
      incrementPlayCount(trackId);
    }
  };

  const incrementPlayCount = async (trackId: string) => {
    try {
      await supabase.rpc('increment_track_play_count', { track_id: trackId });
    } catch (error) {
      console.error("Error incrementing play count:", error);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm("Are you sure you want to delete this track? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;
      
      setTracks(tracks.filter(track => track.id !== trackId));
      toast({
        title: "Track deleted",
        description: "Your track has been successfully deleted"
      });
    } catch (error) {
      console.error("Error deleting track:", error);
      toast({
        title: "Error",
        description: "Could not delete track",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">My Tracks</h1>
                <p className="text-gray-400">Manage your uploaded music</p>
              </div>
              <UploadTrackModal />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-audifyx-purple"></div>
              </div>
            ) : tracks.length === 0 ? (
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Music className="h-16 w-16 text-audifyx-purple mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
                  <p className="text-gray-400 mb-6">Upload your first track to get started!</p>
                  <UploadTrackModal />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tracks.map(track => (
                  <Card key={track.id} className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 overflow-hidden">
                    <div className="aspect-square bg-audifyx-charcoal/50 relative">
                      {track.cover_url ? (
                        <img 
                          src={track.cover_url} 
                          alt={track.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-audifyx-purple/20 to-audifyx-blue/20">
                          <Music className="h-16 w-16 text-audifyx-purple/60" />
                        </div>
                      )}
                      <Button 
                        size="icon" 
                        className="absolute bottom-4 right-4 rounded-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                        onClick={() => handlePlay(track.id, track.track_url)}
                      >
                        <Play className={`h-5 w-5 ${currentlyPlaying === track.id ? 'text-white' : 'text-white'}`} />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-gray-400 hover:text-red-500"
                          onClick={() => handleDeleteTrack(track.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{new Date(track.created_at).toLocaleDateString()}</span>
                        <span>{track.play_count} plays</span>
                      </div>
                      {track.description && (
                        <p className="text-sm mt-2 text-gray-300 line-clamp-2">{track.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
