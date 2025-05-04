
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface SocialFeedPostProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    image_url?: string;
    audio_url?: string;
    user_id: string;
    profiles: {
      username: string;
      avatar_url?: string;
    };
    likes_count?: number;
    comments_count?: number;
  };
  onPostDeleted?: () => void;
}

export function SocialFeedPost({ post, onPostDeleted }: SocialFeedPostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Check if the current user is the post author
  const isAuthor = user?.id === post.user_id;
  
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to login to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (error) throw error;
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: post.id
          });

        if (error) throw error;
        setLiked(true);
        setLikesCount(prev => prev + 1);
        
        // Increment creator stat
        if (user.id !== post.user_id) {
          await supabase.rpc('increment_creator_stat_with_points', {
            creator_id: post.user_id,
            stat_type: 'likes',
            increment_amount: 1
          });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike post",
        variant: "destructive",
      });
    }
  };

  const fetchComments = async () => {
    if (!commentsOpen) {
      setIsLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('post_comments')
          .select(`
            id, 
            content, 
            created_at,
            user_id, 
            profiles:user_id (username, avatar_url)
          `)
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
      } finally {
        setIsLoadingComments(false);
      }
    }
    setCommentsOpen(!commentsOpen);
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;
    
    setIsSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          id, 
          content, 
          created_at,
          user_id, 
          profiles:user_id (username, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      setComments(prev => [...prev, data]);
      setNewComment("");
      
      // Increment comment count for the post
      await supabase
        .from('posts')
        .update({ comments_count: (post.comments_count || 0) + 1 })
        .eq('id', post.id);
      
      // Increment creator stat
      if (user.id !== post.user_id) {
        await supabase.rpc('increment_creator_stat_with_points', {
          creator_id: post.user_id,
          stat_type: 'comments',
          increment_amount: 1
        });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId: string, commentUserId: string) => {
    // Only allow users to delete their own comments
    if (user?.id !== commentUserId) return;
    
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      // Remove from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Decrement comment count
      await supabase
        .from('posts')
        .update({ comments_count: Math.max((post.comments_count || 0) - 1, 0) })
        .eq('id', post.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const deletePost = async () => {
    if (!isAuthor) return;
    
    try {
      // If there's an image, delete it from storage first
      if (post.image_url) {
        const imagePath = post.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage.from('posts').remove([imagePath]);
        }
      }
      
      // If there's audio, delete it from storage
      if (post.audio_url) {
        const audioPath = post.audio_url.split('/').pop();
        if (audioPath) {
          await supabase.storage.from('audio').remove([audioPath]);
        }
      }
      
      // Delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Post deleted",
      });
      
      // Callback to refresh the posts list
      if (onPostDeleted) onPostDeleted();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20 hover:bg-audifyx-purple-dark/40 transition-colors">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback>
                {post.profiles.username[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.profiles.username}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={deletePost}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="mb-4">
          <p>{post.content}</p>
        </div>
        
        {post.image_url && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={post.image_url}
              alt="Post"
              className="w-full object-cover max-h-96"
            />
          </div>
        )}
        
        {post.audio_url && (
          <div className="mt-3">
            <audio className="w-full" controls src={post.audio_url} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0 pb-4">
        <Button
          variant="ghost"
          size="sm"
          className={`${liked ? "text-red-500" : ""}`}
          onClick={handleLike}
        >
          <Heart className="h-4 w-4 mr-1" fill={liked ? "currentColor" : "none"} />
          {likesCount > 0 && <span>{likesCount}</span>}
        </Button>
        
        <Button variant="ghost" size="sm" onClick={fetchComments}>
          <MessageSquare className="h-4 w-4 mr-1" />
          {post.comments_count > 0 && <span>{post.comments_count}</span>}
        </Button>
        
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4 mr-1" />
        </Button>
      </CardFooter>
      
      {/* Comments Dialog */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {isLoadingComments ? (
              <p className="text-center text-gray-400">Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback>
                      {comment.profiles?.username[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">
                        {comment.profiles?.username || "User"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  
                  {user?.id === comment.user_id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                      onClick={() => deleteComment(comment.id, comment.user_id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">No comments yet. Be the first!</p>
            )}
          </div>
          
          <DialogFooter>
            <div className="flex w-full gap-2">
              <Textarea 
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
                maxLength={500}
              />
              <Button 
                onClick={handleComment} 
                disabled={!newComment.trim() || isSubmittingComment}
                className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
              >
                Post
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
