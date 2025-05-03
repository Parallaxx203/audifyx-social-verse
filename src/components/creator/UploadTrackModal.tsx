
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useToast } from "@/hooks";
import { useCreateTrack } from "@/hooks/useDiscoveryFeed";
import { Music, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePoints, PointEventType } from "@/hooks/usePoints";

export function UploadTrackModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutateAsync: createTrack } = useCreateTrack();
  const { awardPoints } = usePoints();
  
  const accountType = user?.user_metadata?.accountType || 'listener';
  const isAllowedToUpload = accountType === 'creator' || accountType === 'brand';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !trackUrl) {
      toast({
        title: "Missing fields",
        description: "Please provide a title and upload a track file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await createTrack({
        user_id: user?.id || "",
        title,
        track_url: trackUrl,
        description,
        cover_url: coverUrl || null,
      });
      
      await awardPoints("POST_CREATION" as PointEventType);

      toast({
        title: "Track uploaded",
        description: "Your track has been successfully uploaded",
      });
      
      setTitle("");
      setDescription("");
      setTrackUrl("");
      setCoverUrl("");
      setOpen(false);
    } catch (error) {
      console.error("Error uploading track:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your track",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAllowedToUpload) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
          <Upload className="mr-2 h-4 w-4" /> Upload Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-audifyx-purple-dark/90 border-audifyx-purple/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" /> Upload New Track
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Track Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter track title"
              className="bg-audifyx-charcoal/50"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your track"
              className="bg-audifyx-charcoal/50"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Upload Audio File (MP3, WAV, M4A only)</label>
            <div className="border-2 border-dashed border-audifyx-purple/30 rounded-lg p-4 bg-audifyx-charcoal/30">
              {trackUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-audifyx-purple" />
                    <span className="text-sm">Audio file uploaded</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setTrackUrl("")}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <MediaUploader
                  onUploadComplete={(url) => setTrackUrl(url)}
                  allowedTypes="audio"
                  userId={user?.id || ""}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Cover Image (JPEG/PNG only)</label>
            <div className="border-2 border-dashed border-audifyx-purple/30 rounded-lg p-4 bg-audifyx-charcoal/30">
              {coverUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={coverUrl} alt="Cover" className="h-12 w-12 object-cover rounded" />
                    <span className="text-sm ml-2">Cover image uploaded</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCoverUrl("")}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <MediaUploader
                  onUploadComplete={(url) => setCoverUrl(url)}
                  allowedTypes="image"
                  userId={user?.id || ""}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="border-audifyx-purple/30"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isUploading || !title || !trackUrl}
              className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            >
              {isUploading ? "Uploading..." : "Upload Track"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
