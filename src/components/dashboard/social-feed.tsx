
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Music, Image, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePoints } from "@/hooks";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Post {
  id: string;
  username: string;
  avatar: string;
  content: string;
  mediaType?: "audio" | "image";
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
  const { awardPoints } = usePoints();
  const { toast } = useToast();
  const [isPostingContent, setIsPostingContent] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showStories, setShowStories] = useState(true);
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
        const formattedData: Post[] = data.map((post) => ({
          id: post.id,
          username: post.profiles?.username || 'Unknown User',
          avatar: post.profiles?.avatar_url || '',
          content: post.content,
          mediaType: post.image_url ? "image" : undefined,
          mediaUrl: post.image_url || undefined,
          likes: 0, // We would fetch this from a likes table
          comments: 0, // We would fetch this from a comments table
          shares: 0, // We would track this separately
          isLiked: false, // We would check if current user liked it
          timestamp: new Date(post.created_at).toLocaleDateString()
        }));

        setPosts(formattedData);
      } else {
        // If no posts, add sample posts
        setPosts([
          {
            id: "sample1",
            username: "demo_user",
            avatar: "/placeholder.svg",
            content: "Just dropped a new track! 🎵 Check it out!",
            mediaType: "audio",
            mediaUrl: "#",
            likes: 42,
            comments: 8,
            shares: 12,
            isLiked: false,
            timestamp: "Just now"
          },
          {
            id: "sample2",
            username: "artist_official",
            avatar: "/placeholder.svg",
            content: "Live streaming tonight! Don't miss it 🎤",
            mediaType: "image",
            mediaUrl: "/placeholder.svg",
            likes: 156,
            comments: 23,
            shares: 45,
            isLiked: true,
            timestamp: "2h ago"
          }
        ]);
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
    if (!post.trim() || !user) return;
    
    setIsPostingContent(true);
    try {
      // Create post in database
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: post,
          user_id: user.id,
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
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        timestamp: 'Just now'
      };
      
      setPosts([newPost, ...posts]);
      setPost("");
      
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

  const stories = [
    {
      id: 1,
      username: "user1",
      avatar: "/placeholder.svg",
      hasUnseenStory: true
    },
    {
      id: 2,
      username: "user2",
      avatar: "/placeholder.svg",
      hasUnseenStory: true
    },
    {
      id: 3,
      username: "user3",
      avatar: "/placeholder.svg",
      hasUnseenStory: false
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {showStories && (
        <div className="overflow-x-auto py-4">
          <div className="flex gap-4">
            {stories.map(story => (
              <div key={story.id} className="flex-shrink-0 hover-scale">
                <div className={`w-16 h-16 rounded-full p-[2px] ${story.hasUnseenStory ? 'bg-gradient-to-tr from-audifyx-purple to-audifyx-blue' : 'bg-gray-700'}`}>
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    {story.avatar ? (
                      <img src={story.avatar} alt={story.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-center mt-1 truncate w-16">{story.username}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-audifyx-purple">
                  <Music className="w-4 h-4 mr-1" />
                  Add Track
                </Button>
                <Button variant="ghost" size="sm" className="text-audifyx-purple">
                  <Image className="w-4 h-4 mr-1" />
                  Add Media
                </Button>
              </div>
              <Button
                onClick={handlePost}
                className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                disabled={isPostingContent || !post.trim()}
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
          <Card key={post.id} className="p-4 bg-audifyx-purple/20">
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
            
            <p className="mb-4">{post.content}</p>
            
            {post.mediaUrl && post.mediaType === "image" && (
              <div className="mb-4 rounded-md overflow-hidden">
                <img src={post.mediaUrl} alt="Post media" className="w-full" />
              </div>
            )}
            
            {post.mediaUrl && post.mediaType === "audio" && (
              <div className="mb-4 bg-audifyx-purple/10 p-3 rounded-md flex items-center">
                <Music className="h-6 w-6 mr-2" />
                <span>Audio track attached</span>
                <Button variant="secondary" size="sm" className="ml-auto">
                  Play
                </Button>
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
          </Card>
        ))
      )}
    </div>
  );
}
