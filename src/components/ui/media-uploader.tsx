
import { UploadCloud, X } from "lucide-react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface MediaUploaderProps {
  onUpload: (file: File) => void
  onClear?: () => void
  accept?: string
  previewUrl?: string | null
  maxSizeMB?: number
  className?: string
  buttonText?: string
  // Add new props
  allowedTypes?: string
  userId?: string
  onUploadComplete?: (url: string) => void
}

export function MediaUploader({
  onUpload,
  onClear,
  accept = "image/*",
  previewUrl = null,
  maxSizeMB = 10,
  className = "",
  buttonText = "Upload File",
  allowedTypes,
  userId,
  onUploadComplete
}: MediaUploaderProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl)
  const [isHovering, setIsHovering] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFile = async (file: File) => {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024 // Convert MB to bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`,
        variant: "destructive"
      })
      return
    }

    // If we have the new upload complete handler, use it
    if (onUploadComplete && userId) {
      await handleServerUpload(file);
      return;
    }

    // Create preview if it's an image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
      // For audio or video, just show the file name as preview
      setPreview(`File: ${file.name}`)
    }

    onUpload(file)
  }

  const handleServerUpload = async (file: File) => {
    if (!userId) return;
    
    setUploading(true);
    try {
      // Determine bucket based on file type
      let bucket = 'posts';
      if (file.type.startsWith('audio/')) bucket = 'audio';
      else if (file.type.startsWith('video/')) bucket = 'videos';
      
      // Create file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      // Create preview if it's an image
      if (file.type.startsWith("image/")) {
        setPreview(publicUrlData.publicUrl);
      } else {
        setPreview(`File: ${file.name}`);
      }
      
      // Call the onUploadComplete callback with the URL
      if (onUploadComplete) {
        onUploadComplete(publicUrlData.publicUrl);
      }
      
      // Also call the normal onUpload for backward compatibility
      onUpload(file);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    handleFile(e.target.files[0])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsHovering(false)
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsHovering(true)
  }

  const handleDragLeave = () => {
    setIsHovering(false)
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (onClear) onClear()
  }

  // Determine accept string based on allowedTypes prop if provided
  const getAcceptString = () => {
    if (!allowedTypes) return accept;
    
    switch(allowedTypes) {
      case 'image': return 'image/*';
      case 'audio': return 'audio/*';
      case 'video': return 'video/*';
      default: return accept;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {preview ? (
        <div className="relative">
          {preview.startsWith("data:image/") || preview.includes("supabase.co") ? (
            <div className="relative aspect-video rounded-md overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-background/10 border border-border rounded-md">
              {preview.startsWith("File:") ? (
                <span className="text-sm">{preview}</span>
              ) : (
                <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full ml-auto"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md transition-colors p-6 flex flex-col items-center justify-center cursor-pointer ${
            isHovering ? "border-primary bg-primary/10" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center mb-1">
            {uploading ? "Uploading..." : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            {getAcceptString() === "image/*"
              ? "Supports: JPG, PNG, GIF"
              : getAcceptString() === "audio/*"
              ? "Supports: MP3, WAV"
              : getAcceptString() === "video/*"
              ? "Supports: MP4, WebM"
              : "Upload your file"}
          </p>
          <Button variant="default" size="sm" className="mt-4" disabled={uploading}>
            {uploading ? "Uploading..." : buttonText}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept={getAcceptString()}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
