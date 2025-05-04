
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Image, Music, X, Loader2 } from "lucide-react";

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    setSelectedAudio(null); // Can't have both image and audio
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedAudio(null);
      return;
    }

    const file = e.target.files[0];
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file",
        description: "Please select an audio file",
        variant: "destructive",
      });
      return;
    }

    setSelectedAudio(file);
    setSelectedImage(null); // Can't have both image and audio
    setImagePreview(null);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const clearAudio = () => {
    setSelectedAudio(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
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

    if (!content.trim() && !selectedImage && !selectedAudio) {
      toast({
        title: "Empty post",
        description: "Please add some content, an image, or audio to your post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      let audioUrl = null;

      // Upload image if selected
      if (selectedImage) {
        const filename = `${Date.now()}-${selectedImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filename, selectedImage);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from("posts")
          .getPublicUrl(filename);

        imageUrl = publicURLData.publicUrl;
      }

      // Upload audio if selected
      if (selectedAudio) {
        const filename = `${Date.now()}-${selectedAudio.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("audio")
          .upload(filename, selectedAudio);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from("audio")
          .getPublicUrl(filename);

        audioUrl = publicURLData.publicUrl;
      }

      // Create post
      const { error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl,
          audio_url: audioUrl,
          comments_count: 0,
          likes_count: 0
        });

      if (postError) throw postError;

      // Reset form
      setContent("");
      setSelectedImage(null);
      setSelectedAudio(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";

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

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mb-4">
            <img
              src={imagePreview}
              alt="Selected"
              className="w-full h-auto max-h-64 object-contain rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={clearImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Audio Preview */}
        {selectedAudio && (
          <div className="relative mb-4 flex items-center gap-3 bg-audifyx-purple/10 rounded-md p-3">
            <Music className="h-6 w-6" />
            <span className="text-sm truncate">{selectedAudio.name}</span>
            <Button
              variant="destructive"
              size="icon"
              className="ml-auto h-6 w-6 rounded-full"
              onClick={clearAudio}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => imageInputRef.current?.click()}
              disabled={!!selectedAudio}
            >
              <Image className="h-4 w-4 mr-1" />
              Photo
            </Button>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => audioInputRef.current?.click()}
              disabled={!!selectedImage}
            >
              <Music className="h-4 w-4 mr-1" />
              Audio
            </Button>
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioChange}
              className="hidden"
              accept="audio/*"
            />
          </div>

          <Button
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !selectedImage && !selectedAudio)}
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
