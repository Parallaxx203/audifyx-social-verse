
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  created_at: string;
  type: 'image' | 'video';
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

export function StoryComponent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();

    // Subscribe to changes in the stories table
    const channel = supabase
      .channel('stories-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stories',
      }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStories = async () => {
    try {
      // First, fetch stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('id, user_id, media_url, created_at, type')
        .order('created_at', { ascending: false })
        // Filter to only show stories from the last 24 hours
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (storiesError) throw storiesError;
      
      if (!storiesData || storiesData.length === 0) {
        setStories([]);
        return;
      }
      
      // Then, fetch profile information for each story
      const userIds = [...new Set(storiesData.map(story => story.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Combine stories with profile data
      const storiesWithProfiles = storiesData.map(story => {
        const profile = profilesData?.find(profile => profile.id === story.user_id);
        return {
          ...story,
          profiles: {
            username: profile?.username || 'Unknown user',
            avatar_url: profile?.avatar_url
          }
        };
      });
      
      setStories(storiesWithProfiles);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload stories",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image or video
    const fileType = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : null;

    if (!fileType) {
      toast({
        title: "Error",
        description: "Only images and videos are allowed",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const filename = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(`stories/${filename}`, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('media')
        .getPublicUrl(`stories/${filename}`);

      // Insert story record
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicURL.publicUrl,
          type: fileType
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Story uploaded successfully",
      });

      fetchStories();
    } catch (error) {
      console.error("Error uploading story:", error);
      toast({
        title: "Error",
        description: "Failed to upload story",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the input
      if (e.target) e.target.value = '';
    }
  };

  const viewStory = (story: Story) => {
    setSelectedStory(story);
    setIsStoryOpen(true);
  };

  const renderStoryContent = () => {
    if (!selectedStory) return null;
    
    return selectedStory.type === 'image' ? (
      <img
        src={selectedStory.media_url}
        alt="Story"
        className="max-h-[80vh] object-contain"
      />
    ) : (
      <video
        src={selectedStory.media_url}
        controls
        autoPlay
        className="max-h-[80vh] object-contain"
      />
    );
  };

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {/* Add Story Button */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-audifyx-purple/30 flex items-center justify-center">
              <label className="cursor-pointer flex items-center justify-center w-full h-full">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <PlusCircle size={24} className="text-white" />
                )}
              </label>
            </div>
            <p className="text-xs text-center mt-1 truncate w-20">
              {isUploading ? "Uploading..." : "Add Story"}
            </p>
          </div>
        </div>

        {/* Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 cursor-pointer" onClick={() => viewStory(story)}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-audifyx-purple to-audifyx-blue p-[2px]">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={story.profiles.avatar_url} />
                  <AvatarFallback>{story.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <p className="text-xs text-center mt-1 truncate w-20">{story.profiles.username}</p>
          </div>
        ))}
      </div>

      {/* Story Viewer */}
      <Dialog open={isStoryOpen} onOpenChange={setIsStoryOpen}>
        <DialogContent className="sm:max-w-lg p-0 bg-black border-none">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedStory?.profiles.avatar_url} />
                <AvatarFallback>
                  {selectedStory?.profiles.username.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <DialogTitle className="text-white">
                {selectedStory?.profiles.username}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-white"
              onClick={() => setIsStoryOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          
          <div className="flex items-center justify-center h-full">
            {renderStoryContent()}
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
