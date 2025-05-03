
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/ui/media-uploader";
import { Upload, Music } from "lucide-react";

export function UploadTrackModal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleTrackUpload = (url: string) => {
    setTrackUrl(url);
  };

  const handleCoverUpload = (url: string) => {
    setCoverUrl(url);
  };

  const handleSubmit = async () => {
    if (!title || !trackUrl) {
      toast({
        title: "Missing information",
        description: "Please provide a title and upload a track.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data, error } = await supabase.from("tracks").insert({
        title,
        description,
        genre,
        track_url: trackUrl,
        cover_url: coverUrl || null,
        user_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Track uploaded successfully!",
        description: "Your track has been added to your collection.",
      });

      // Reset form and close dialog
      setTitle("");
      setDescription("");
      setGenre("");
      setTrackUrl("");
      setCoverUrl("");
      setOpen(false);
    } catch (error) {
      console.error("Error uploading track:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
          <Upload className="mr-2 h-4 w-4" />
          Upload Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-audifyx-charcoal border-audifyx-purple/30">
        <DialogHeader>
          <DialogTitle>Upload New Track</DialogTitle>
          <DialogDescription>
            Share your music with the Audifyx community.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Track Title</Label>
            <Input
              id="title"
              placeholder="Enter track title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-audifyx-charcoal/50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your track"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-audifyx-charcoal/50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="genre">Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="bg-audifyx-charcoal/50">
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent className="bg-audifyx-charcoal border-audifyx-purple/30">
                <SelectItem value="pop">Pop</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
                <SelectItem value="hip-hop">Hip Hop</SelectItem>
                <SelectItem value="electronic">Electronic</SelectItem>
                <SelectItem value="jazz">Jazz</SelectItem>
                <SelectItem value="classical">Classical</SelectItem>
                <SelectItem value="r&b">R&B</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="folk">Folk</SelectItem>
                <SelectItem value="indie">Indie</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Upload Track (MP3)</Label>
            {trackUrl ? (
              <div className="bg-audifyx-purple/10 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Music className="h-5 w-5 mr-2 text-audifyx-purple" />
                    <span className="text-sm">Track uploaded successfully</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTrackUrl("")}
                    className="text-gray-400 hover:text-white"
                  >
                    Change
                  </Button>
                </div>
                <audio controls className="w-full mt-2">
                  <source src={trackUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <MediaUploader
                allowedTypes="audio"
                userId={user?.id || ""}
                onUploadComplete={handleTrackUpload}
              />
            )}
          </div>
          <div className="grid gap-2">
            <Label>Cover Art (Optional)</Label>
            {coverUrl ? (
              <div className="relative aspect-square max-w-[200px] mx-auto">
                <img
                  src={coverUrl}
                  alt="Cover art"
                  className="w-full h-full object-cover rounded-md"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCoverUrl("")}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 h-8 w-8"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <MediaUploader
                allowedTypes="both"
                userId={user?.id || ""}
                onUploadComplete={handleCoverUpload}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-audifyx-purple/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            disabled={isUploading || !title || !trackUrl}
          >
            {isUploading ? "Uploading..." : "Upload Track"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
