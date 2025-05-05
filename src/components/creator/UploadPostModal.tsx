
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePointsSystem } from "@/hooks/usePointsSystem";
import { Image, Video, Music, Upload, Loader2 } from "lucide-react";

export function UploadPostModal() {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video" | "audio">("photo");
  const { toast } = useToast();
  const { user } = useAuth();
  const { addPostPoints } = usePointsSystem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileType = (file: File, type: "photo" | "video" | "audio") => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/x-m4a'];
    
    if (type === 'photo' && !allowedImageTypes.includes(file.type)) {
      toast({
        title: "Invalid image type",
        description: "Only JPEG, JPG and PNG images are allowed.",
        variant: "destructive",
      });
      return false;
    }
    
    if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
      toast({
        title: "Invalid video type",
        description: "Only MP4, MOV, and AVI videos are allowed.",
        variant: "destructive",
      });
      return false;
    }
    
    if (type === 'audio' && !allowedAudioTypes.includes(file.type)) {
      toast({
        title: "Invalid audio type",
        description: "Only MP3, MP4, WAV, and M4A audio files are allowed.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!validateFileType(file, mediaType)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setMediaFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleSubmit = async () => {
    if (!mediaFile || !user || !caption.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a caption and select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileName = `${Date.now()}_${mediaFile.name.replace(/\s+/g, "_")}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, mediaFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const mediaUrl = supabase.storage.from("posts").getPublicUrl(filePath).data.publicUrl;

      // Create post record
      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        type: mediaType,
        url: mediaUrl,
        caption: caption
      });

      if (postError) throw postError;

      // Award points for post creation
      await addPostPoints(user.id);

      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      });

      // Reset form
      setCaption("");
      setMediaFile(null);
      setMediaPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setOpen(false);
    } catch (error) {
      console.error("Error uploading post:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-audifyx-purple hover:bg-audifyx-purple-vivid">
          <Upload className="h-4 w-4" /> Upload Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your content with the community
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="photo" className="w-full" onValueChange={(value) => setMediaType(value as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="photo">
              <Image className="mr-2 h-4 w-4" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="mr-2 h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Music className="mr-2 h-4 w-4" />
              Audio
            </TabsTrigger>
          </TabsList>
          
          {/* Common form fields for all media types */}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something about your post..."
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="media">Upload Media</Label>
              <Input 
                id="media" 
                ref={fileInputRef}
                type="file"
                accept={
                  mediaType === "photo" ? "image/jpeg,image/png,image/jpg" : 
                  mediaType === "video" ? "video/mp4,video/quicktime,video/x-msvideo" : 
                  "audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a"
                }
                onChange={handleFileChange}
              />
            </div>

            {/* Preview area */}
            {mediaPreview && (
              <div className="mt-2 border border-audifyx-purple/30 rounded-md p-2 bg-audifyx-charcoal/30">
                {mediaType === "photo" && (
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    className="w-full h-auto max-h-[200px] object-contain" 
                  />
                )}
                {mediaType === "video" && (
                  <video 
                    src={mediaPreview} 
                    controls 
                    className="w-full h-auto max-h-[200px]" 
                  />
                )}
                {mediaType === "audio" && (
                  <audio 
                    src={mediaPreview} 
                    controls 
                    className="w-full" 
                  />
                )}
              </div>
            )}
          </div>
        </Tabs>

        <DialogFooter>
          <Button 
            disabled={isUploading} 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            disabled={isUploading || !caption || !mediaFile} 
            onClick={handleSubmit} 
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Publish Post"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
