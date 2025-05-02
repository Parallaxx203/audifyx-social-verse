
import { useState } from "react";
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
import { useToast } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { usePoints } from "@/hooks/usePoints";
import { Image, Video, Music, Upload } from "lucide-react";

export function UploadPostModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { awardPoints } = usePoints();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine file type
    if (file.type.startsWith("image/")) {
      setMediaType("image");
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
    } else if (file.type.startsWith("audio/")) {
      setMediaType("audio");
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please upload an image, video, or audio file.",
        variant: "destructive",
      });
      return;
    }

    setMediaFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleSubmit = async () => {
    if (!title || !mediaFile || !user) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields and upload a media file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileName = `${Date.now()}_${mediaFile.name.replace(/\s+/g, "_")}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from("posts")
        .upload(filePath, mediaFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const mediaUrl = supabase.storage.from("posts").getPublicUrl(filePath).data.publicUrl;

      // Create post record
      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        title,
        content: description,
        media_url: mediaUrl,
        media_type: mediaType
      });

      if (postError) throw postError;

      // Award points for post creation
      await awardPoints("POST_CREATION");

      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setMediaFile(null);
      setMediaPreview(null);
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

        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="image" onClick={() => setMediaType("image")}>
              <Image className="mr-2 h-4 w-4" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="video" onClick={() => setMediaType("video")}>
              <Video className="mr-2 h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="audio" onClick={() => setMediaType("audio")}>
              <Music className="mr-2 h-4 w-4" />
              Audio
            </TabsTrigger>
          </TabsList>
          
          {/* Common form fields for all media types */}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something about your post..."
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="media">Upload Media</Label>
              <Input 
                id="media" 
                type="file"
                accept={
                  mediaType === "image" ? "image/*" : 
                  mediaType === "video" ? "video/*" : 
                  mediaType === "audio" ? "audio/*" : 
                  "image/*,video/*,audio/*"
                }
                onChange={handleFileChange}
              />
            </div>

            {/* Preview area */}
            {mediaPreview && (
              <div className="mt-2 border border-audifyx-purple/30 rounded-md p-2 bg-audifyx-charcoal/30">
                {mediaType === "image" && (
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
            disabled={isUploading || !title || !mediaFile} 
            onClick={handleSubmit} 
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
          >
            {isUploading ? "Uploading..." : "Publish Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
