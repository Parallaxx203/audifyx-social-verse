
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Music, Video, Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MediaUploaderProps {
  onUploadComplete: (url: string, type: "audio" | "video") => void;
  allowedTypes?: "audio" | "video" | "both";
  userId: string;
}

export function MediaUploader({ 
  onUploadComplete, 
  allowedTypes = "both", 
  userId 
}: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<"audio" | "video" | null>(null);

  // Determine accepted file types based on props
  const getAcceptedTypes = () => {
    switch (allowedTypes) {
      case "audio":
        return "audio/mp3,audio/mpeg";
      case "video":
        return "video/mp4";
      case "both":
      default:
        return "audio/mp3,audio/mpeg,video/mp4";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      
      // Validate file type
      if (fileType.startsWith("audio/")) {
        setMediaType("audio");
      } else if (fileType.startsWith("video/")) {
        setMediaType("video");
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an MP3 or MP4 file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 50MB",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const uploadFile = async () => {
    if (!file || !userId || !mediaType) return;
    
    try {
      setUploading(true);
      setProgress(0);
      
      // Determine bucket based on media type
      const bucket = mediaType === "audio" ? "audio_files" : "video_files";
      const filePath = `${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      // Upload the file to Supabase storage with progress tracking
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      toast({
        title: "Upload successful",
        description: `Your ${mediaType} file has been uploaded.`
      });
      
      onUploadComplete(urlData.publicUrl, mediaType);
      setFile(null);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file",
        variant: "destructive"
      });
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-4">
      {!file ? (
        <>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full py-8 border-dashed border-2 flex flex-col gap-2 items-center justify-center bg-background/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6" />
              <span>
                {allowedTypes === "both" && "Upload MP3 or MP4"}
                {allowedTypes === "audio" && "Upload MP3"}
                {allowedTypes === "video" && "Upload MP4"}
              </span>
              <span className="text-xs text-muted-foreground">
                Max file size: 50MB
              </span>
            </Button>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedTypes()}
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      ) : (
        <div className="bg-background/10 rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mediaType === "audio" ? (
                <Music className="h-5 w-5 text-audifyx-purple" />
              ) : (
                <Video className="h-5 w-5 text-audifyx-blue" />
              )}
              <div className="truncate text-sm">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelUpload}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-right">{progress}%</div>
            </div>
          ) : (
            <Button
              onClick={uploadFile}
              className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            >
              Upload
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
