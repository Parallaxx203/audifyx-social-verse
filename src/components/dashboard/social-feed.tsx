
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Music, Image, User, File, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePoints } from "@/hooks";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/ui/media-uploader";

export interface Post {
  id: string;
  username: string;
  avatar: string;
  content: string;
  mediaType?: "audio" | "image" | "video";
  mediaUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  timestamp: string;
}

export function SocialFeed() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [post, setPost] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"audio" | "image" | "video" | null>(null);
  const [showMediaUploader, setShowMediaUploader] = useState<"audio" | "image" | "video" | null>(null);
  const { awardPoints } = usePoints();
  const { toast } = useToast();
  const [isPostingContent, setIsPostingContent] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      // Fetch posts with user information
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        // Format data to include username and avatar at the top level
        const formattedData: Post[] = data.map((post) => {
          let detectedMediaType: "audio" | "image" | "video" | undefined = undefined;
          
          if (post.image_url) {
            const fileExt = post.image_url.split('.').pop()?.toLowerCase();
            if (fileExt) {
              if (['mp3', 'wav', 'm4a'].includes(fileExt)) {
                detectedMediaType = "audio";
              } else if (['mp4', 'webm', 'ogg'].includes(fileExt)) {
                detectedMediaType = "video";
              } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
                detectedMediaType = "image";
              }
            }
          }
          
          return {
            id: post.id,
            username: post.profiles?.username || 'Unknown User',
            avatar: post.profiles?.avatar_url || '',
            content: post.content,
            mediaType: detectedMediaType,
            mediaUrl: post.image_url || undefined,
            likes: 0, // We would fetch this from a likes table
            comments: 0, // We would fetch this from a comments table
            shares: 0, // We would track this separately
            isLiked: false, // We would check if current user liked it
            timestamp: new Date(post.created_at).toLocaleDateString()
          };
        });

        setPosts(formattedData);
      } else {
        // If no posts, show empty state
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handlePost = async () => {
    if ((!post.trim() && !mediaUrl) || !user) return;
    
    setIsPostingContent(true);
    try {
      // Create post in database
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: post,
          user_id: user.id,
          image_url: mediaUrl
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add the new post to the posts array
      const newPost: Post = {
        id: data.id,
        username: profile?.username || user.email?.split('@')[0] || 'User',
        avatar: profile?.avatar_url || '',
        content: post,
        mediaType: mediaType || undefined,
        mediaUrl: mediaUrl || undefined,
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        timestamp: 'Just now'
      };
      
      setPosts([newPost, ...posts]);
      setPost("");
      setMediaUrl(null);
      setMediaType(null);
      setShowMediaUploader(null);
      
      // Award points
      await awardPoints('POST_CREATION');
      toast({
        title: "Post created",
        description: "Your post has been published successfully"
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again later.",
        variant: 'destructive'
      });
    } finally {
      setIsPostingContent(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Toggle like status for the post
    setPosts(posts.map(post =>
      post.id === postId ? {
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1
      } : post
    ));
    
    try {
      // In a real app, we would call an API to like/unlike the post
      // For now, we'll just award points
      if (!posts.find(p => p.id === postId)?.isLiked) {
        await awardPoints('LIKE', { postId });
        toast({
          title: "Post liked",
          description: "You earned points for liking this post"
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert the optimistic update
      setPosts(posts.map(post =>
        post.id === postId ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        } : post
      ));
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: 'destructive'
      });
    }
  };

  const handleComment = async (postId: string) => {
    // In a real app, we would open a comment modal
    // For now, we'll just increment the comment count and award points
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, comments: post.comments + 1 } : post
    ));
    
    try {
      await awardPoints('COMMENT', { postId });
      toast({
        title: "Comment added",
        description: "You earned points for commenting"
      });
    } catch (error) {
      console.error('Error commenting on post:', error);
      // Revert the optimistic update
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, comments: post.comments - 1 } : post
      ));
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: 'destructive'
      });
    }
  };

  const handleShare = async (postId: string) => {
    // In a real app, we would open a share modal
    // For now, we'll just increment the share count and award points
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, shares: post.shares + 1 } : post
    ));
    
    try {
      await awardPoints('SHARE', { postId });
      toast({
        title: "Post shared",
        description: "You earned points for sharing this post"
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      // Revert the optimistic update
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, shares: post.shares - 1 } : post
      ));
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: 'destructive'
      });
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
    setShowMediaUploader(null);
  };

  const handleMediaSelect = (type: "audio" | "image" | "video") => {
    setShowMediaUploader(type);
  };

  const handleMediaUpload = (url: string) => {
    setMediaUrl(url);
    setMediaType(showMediaUploader);
    setShowMediaUploader(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-4 bg-audifyx-purple-dark/30 backdrop-blur-sm border-audifyx-purple/20">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share your music, thoughts, or updates..."
              value={post}
              onChange={e => setPost(e.target.value)}
              className="mb-2 bg-transparent resize-none"
              rows={2}
            />
            
            {showMediaUploader && (
              <div className="mb-4 p-3 bg-audifyx-purple/10 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">
                    {showMediaUploader === "audio" ? "Add Audio File" : 
                     showMediaUploader === "video" ? "Add Video" : "Add Image"}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowMediaUploader(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <MediaUploader
                  onUploadComplete={handleMediaUpload}
                  allowedTypes={showMediaUploader === "audio" ? "audio" : showMediaUploader === "video" ? "video" : "image"}
                  userId={user?.id || ""}
                />
              </div>
            )}
            
            {mediaUrl && !showMediaUploader && (
              <div className="mb-3 p-3 bg-audifyx-purple/10 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  {mediaType === "audio" && <Music className="h-5 w-5 mr-2" />}
                  {mediaType === "video" && <File className="h-5 w-5 mr-2" />}
                  {mediaType === "image" && <Image className="h-5 w-5 mr-2" />}
                  <span className="text-sm truncate">Media attached</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemoveMedia}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {!showMediaUploader && !mediaUrl && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-audifyx-purple"
                      onClick={() => handleMediaSelect("audio")}
                    >
                      <Music className="w-4 h-4 mr-1" />
                      Add Track
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-audifyx-purple"
                      onClick={() => handleMediaSelect("image")}
                    >
                      <Image className="w-4 h-4 mr-1" />
                      Add Image
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-audifyx-purple"
                      onClick={() => handleMediaSelect("video")}
                    >
                      <File className="w-4 h-4 mr-1" />
                      Add Video
                    </Button>
                  </>
                )}
              </div>
              <Button
                onClick={handlePost}
                className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                disabled={isPostingContent || (!post.trim() && !mediaUrl)}
              >
                {isPostingContent ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {isLoadingPosts ? (
        <div className="text-center py-8 text-gray-400">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No posts yet. Be the first to post!</div>
      ) : (
        posts.map(post => (
          <Card key={post.id} className="overflow-hidden bg-audifyx-purple/20">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  {post.avatar ? (
                    <AvatarImage src={post.avatar} />
                  ) : (
                    <AvatarFallback>{post.username[0].toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">@{post.username}</p>
                  <p className="text-sm text-gray-400">{post.timestamp}</p>
                </div>
              </div>
              
              {post.content && <p className="mb-4">{post.content}</p>}
              
              {post.mediaUrl && post.mediaType === "image" && (
                <div className="mb-4 rounded-md overflow-hidden">
                  <img src={post.mediaUrl} alt="Post media" className="w-full" />
                </div>
              )}
              
              {post.mediaUrl && post.mediaType === "audio" && (
                <div className="mb-4 bg-audifyx-purple/10 p-3 rounded-md">
                  <audio controls className="w-full">
                    <source src={post.mediaUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              
              {post.mediaUrl && post.mediaType === "video" && (
                <div className="mb-4 bg-audifyx-purple/10 rounded-md overflow-hidden">
                  <video controls className="w-full">
                    <source src={post.mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={post.isLiked ? "text-audifyx-purple" : ""}
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-audifyx-purple' : ''}`} />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  {post.shares}
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
