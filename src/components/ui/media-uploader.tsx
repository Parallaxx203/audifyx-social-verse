
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  onUploadComplete: (url: string) => void;
  allowedTypes: "audio" | "video" | "both" | "image";
  userId: string;
}

export function MediaUploader({ onUploadComplete, allowedTypes, userId }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const getAcceptString = () => {
    switch (allowedTypes) {
      case "audio":
        return "audio/*";
      case "video":
        return "video/*";
      case "image":
        return "image/*";
      case "both":
        return "audio/*,video/*,image/*";
      default:
        return "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (allowedTypes === "audio" && !file.type.startsWith("audio/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file.",
          variant: "destructive",
        });
        return;
      }
      
      if (allowedTypes === "video" && !file.type.startsWith("video/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file.",
          variant: "destructive",
        });
        return;
      }
      
      if (allowedTypes === "image" && !file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);
    
    try {
      // Determine bucket based on file type
      let bucket = "media";
      if (selectedFile.type.startsWith("audio/")) {
        bucket = "audio";
      } else if (selectedFile.type.startsWith("video/")) {
        bucket = "videos";
      } else if (selectedFile.type.startsWith("image/")) {
        bucket = "images";
      }
      
      // Generate a unique filename to avoid collisions
      const timestamp = new Date().getTime();
      const fileExtension = selectedFile.name.split(".").pop();
      const fileName = `${userId}_${timestamp}.${fileExtension}`;
      
      // Upload file to Supabase Storage with progress tracking
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      
      onUploadComplete(publicUrl);
      
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };
  
  const cancelUpload = () => {
    setSelectedFile(null);
  };
  
  return (
    <div className="bg-audifyx-charcoal/30 rounded-md border border-audifyx-purple/20 p-4">
      {!selectedFile ? (
        <div className="flex flex-col items-center justify-center py-4">
          <UploadCloud className="h-10 w-10 mb-2 text-gray-400" />
          <p className="text-sm text-gray-400 mb-4">
            {allowedTypes === "audio" && "Drag and drop audio files, or click to select"}
            {allowedTypes === "video" && "Drag and drop video files, or click to select"}
            {allowedTypes === "image" && "Drag and drop image files, or click to select"}
            {allowedTypes === "both" && "Drag and drop files, or click to select"}
          </p>
          <Button
            variant="outline"
            className="relative border-audifyx-purple/30 bg-audifyx-charcoal/70"
            onClick={() => document.getElementById(`file-upload-${userId}`)?.click()}
          >
            Select File
            <input
              type="file"
              id={`file-upload-${userId}`}
              className="sr-only"
              onChange={handleFileChange}
              accept={getAcceptString()}
            />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="truncate flex-1">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <Button variant="ghost" size="sm" onClick={cancelUpload} className="ml-2 h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 bg-audifyx-charcoal" />
              <p className="text-xs text-right">{progress}%</p>
            </div>
          ) : (
            <Button 
              className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid" 
              onClick={handleUpload}
            >
              Upload
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
