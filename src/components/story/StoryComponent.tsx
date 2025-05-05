
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  media_url: string;
  created_at: string;
  type: "image" | "video";
  user: {
    username: string;
    avatar_url?: string;
  };
}

export function StoryComponent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [viewStoryOpen, setViewStoryOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      // In a real implementation, we would fetch stories from the database
      // For now, we're just setting an empty array
      setStories([]);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async () => {
    if (!user || !storyFile) return;

    setUploading(true);
    try {
      const fileExt = storyFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Determine if it's an image or video
      const type = storyFile.type.startsWith("image/") ? "image" : "video";
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, storyFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);
      
      // Create the story record
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrlData.publicUrl,
          type
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your story has been published",
      });
      
      // Reset the form and close the dialog
      setStoryFile(null);
      setCreateStoryOpen(false);
      
      // Refetch stories
      fetchStories();
      
    } catch (error) {
      console.error("Error creating story:", error);
      toast({
        title: "Error",
        description: "Failed to create story",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStoryClick = (story: Story) => {
    setActiveStory(story);
    setViewStoryOpen(true);
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">Stories</h2>
      
      <div className="flex space-x-3 overflow-x-auto pb-3">
        {/* Create Story Button */}
        <div 
          className="flex flex-col items-center cursor-pointer min-w-[80px]"
          onClick={() => setCreateStoryOpen(true)}
        >
          <div className="relative mb-1">
            <Avatar className="w-16 h-16 border-2 border-audifyx-purple">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.username?.[0]?.toUpperCase() || "Y"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-audifyx-purple text-white rounded-full p-1">
              <Plus className="h-3 w-3" />
            </div>
          </div>
          <span className="text-xs text-center">Add Story</span>
        </div>
        
        {/* Story Items */}
        {loading ? (
          <div className="text-center text-gray-400">Loading stories...</div>
        ) : stories.length > 0 ? (
          stories.map(story => (
            <div 
              key={story.id} 
              className="flex flex-col items-center cursor-pointer min-w-[80px]"
              onClick={() => handleStoryClick(story)}
            >
              <Avatar className="w-16 h-16 border-2 border-audifyx-purple">
                <AvatarImage src={story.user.avatar_url} />
                <AvatarFallback>
                  {story.user.username[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-center mt-1">{story.user.username}</span>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            No stories yet. Be the first to add one!
          </div>
        )}
      </div>
      
      {/* Create Story Dialog */}
      <Dialog open={createStoryOpen} onOpenChange={setCreateStoryOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a Story</DialogTitle>
          </DialogHeader>
          
          <MediaUploader
            onUpload={(file) => setStoryFile(file)}
            accept="image/*,video/*"
            maxSizeMB={20}
            buttonText="Upload Media"
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setCreateStoryOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateStory} 
              disabled={!storyFile || uploading}
              className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            >
              {uploading ? "Uploading..." : "Create Story"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Story Dialog */}
      {activeStory && (
        <Dialog open={viewStoryOpen} onOpenChange={setViewStoryOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
            <div className="relative">
              {activeStory.type === "image" ? (
                <img 
                  src={activeStory.media_url} 
                  alt="Story" 
                  className="w-full h-auto"
                />
              ) : (
                <video 
                  src={activeStory.media_url} 
                  className="w-full h-auto" 
                  autoPlay 
                  controls
                />
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/30 text-white rounded-full"
                onClick={() => setViewStoryOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarImage src={activeStory.user.avatar_url} />
                    <AvatarFallback>
                      {activeStory.user.username[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-white">{activeStory.user.username}</p>
                    <p className="text-xs text-gray-200">
                      {formatDistanceToNow(new Date(activeStory.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
