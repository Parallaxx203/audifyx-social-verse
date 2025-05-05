
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Image, Music, Video, X, Loader2 } from "lucide-react";
import { MediaUploader } from "@/components/ui/media-uploader";
import { Badge } from "@/components/ui/badge";
import { usePointsSystem } from "@/hooks/usePointsSystem";

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<"photo" | "audio" | "video" | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { addPoints } = usePointsSystem();

  const clearMedia = () => {
    setMediaType(null);
    setMediaUrl(null);
    setPreviewType(null);
  };

  const handleMediaUploadComplete = (url: string) => {
    setMediaUrl(url);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to login to create posts",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() && !mediaUrl) {
      toast({
        title: "Empty post",
        description: "Please add some content, an image, audio, or video to your post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create post
      const { error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim(),
          type: mediaType || "text",
          url: mediaUrl
        });

      if (postError) throw postError;

      // Add points for creating content
      const pointsValue = mediaType ? 
        (mediaType === 'photo' ? 10 : 
         mediaType === 'audio' ? 15 : 
         mediaType === 'video' ? 20 : 5) : 5;
      
      await addPoints(user.id, pointsValue, `post_${mediaType || 'text'}`);

      // Reset form
      setContent("");
      clearMedia();

      toast({
        title: "Success",
        description: "Your post has been published",
      });

      // Callback to refresh posts
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20 mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none bg-audifyx-purple-dark/50 border-audifyx-purple/30"
            maxLength={500}
          />
        </div>

        {/* Media Type Selector - Only show if no media is selected yet */}
        {!mediaType && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-audifyx-purple/20 transition-colors"
              onClick={() => setMediaType("photo")}
            >
              <Image className="h-3 w-3 mr-1" /> Photo
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-audifyx-purple/20 transition-colors"
              onClick={() => setMediaType("audio")}
            >
              <Music className="h-3 w-3 mr-1" /> Audio
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-audifyx-purple/20 transition-colors"
              onClick={() => setMediaType("video")}
            >
              <Video className="h-3 w-3 mr-1" /> Video
            </Badge>
          </div>
        )}

        {/* Media Upload Area */}
        {mediaType && !mediaUrl && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Upload {mediaType === "photo" ? "Photo" : mediaType === "audio" ? "Audio" : "Video"}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearMedia}
                className="h-7 px-2 text-xs"
              >
                Cancel
              </Button>
            </div>
            <MediaUploader
              allowedTypes={mediaType}
              userId={user?.id || ""}
              onUploadComplete={handleMediaUploadComplete}
              onUpload={() => {}}
              maxSizeMB={mediaType === "video" ? 50 : 20}
              buttonText={`Upload ${mediaType === "photo" ? "Photo" : mediaType === "audio" ? "Audio" : "Video"}`}
            />
          </div>
        )}

        {/* Media Preview */}
        {mediaUrl && (
          <div className="mb-4 relative">
            {mediaType === "photo" && (
              <img 
                src={mediaUrl} 
                alt="Post" 
                className="w-full h-auto max-h-64 object-contain rounded-md" 
              />
            )}
            {mediaType === "audio" && (
              <audio controls className="w-full">
                <source src={mediaUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            {mediaType === "video" && (
              <video 
                controls 
                className="w-full h-auto max-h-64 object-contain rounded-md"
              >
                <source src={mediaUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={clearMedia}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !mediaUrl)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
