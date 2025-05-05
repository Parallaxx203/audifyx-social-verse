
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MediaUploader } from "@/components/ui/media-uploader"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Upload } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function UploadPostModal() {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [caption, setCaption] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<"photo" | "video" | "audio">("photo")
  
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileSelect = (file: File) => {
    setMediaFile(file)
    
    // Determine media type from file
    if (file.type.startsWith("image/")) {
      setMediaType("photo")
    } else if (file.type.startsWith("video/")) {
      setMediaType("video")
    } else if (file.type.startsWith("audio/")) {
      setMediaType("audio")
    }
  }
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to post",
        variant: "destructive",
      })
      return
    }
    
    if (!mediaFile && !caption.trim()) {
      toast({
        title: "Empty post",
        description: "Please add text or media to your post",
        variant: "destructive",
      })
      return
    }
    
    setIsUploading(true)
    
    try {
      let mediaUrl = null
      
      // Upload media file if present
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        // Upload to appropriate bucket based on media type
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, mediaFile)
          
        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath)
          
        mediaUrl = publicUrlData.publicUrl
      }
      
      // Create post record
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: caption,
          type: mediaFile ? mediaType : null,
          url: mediaUrl
        })
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Your post has been published",
      })
      
      // Reset form and close modal
      setCaption("")
      setMediaFile(null)
      setOpen(false)
      
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
          <Upload className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-audifyx-purple-dark/80 border-audifyx-purple/30">
        <DialogHeader>
          <DialogTitle className="text-center">Create New Post</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="photo" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="photo">Photo</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="photo">
            <MediaUploader
              onUpload={handleFileSelect}
              onClear={() => setMediaFile(null)}
              accept="image/*"
              maxSizeMB={5}
              buttonText="Upload Photo"
            />
          </TabsContent>
          
          <TabsContent value="video">
            <MediaUploader
              onUpload={handleFileSelect}
              onClear={() => setMediaFile(null)}
              accept="video/*"
              maxSizeMB={20}
              buttonText="Upload Video"
            />
          </TabsContent>
          
          <TabsContent value="audio">
            <MediaUploader
              onUpload={handleFileSelect}
              onClear={() => setMediaFile(null)}
              accept="audio/*" 
              maxSizeMB={10}
              buttonText="Upload Audio"
            />
          </TabsContent>
        </Tabs>
        
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption..."
          className="min-h-[100px] bg-background/10 border-border"
        />
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Post
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
