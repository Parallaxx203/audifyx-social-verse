
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
    type?: string; 
    url?: string;
    user_id: string;
    profiles: {
      username: string;
      avatar_url?: string;
    };
  };
  onPostDeleted?: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export function SocialFeedPost({ post, onPostDeleted }: SocialFeedPostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
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

    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    
    // In a real app, you would update a likes table in the database
    // This is just a UI update for now
  };

  const fetchComments = async () => {
    if (!commentsOpen) {
      setIsLoadingComments(true);
      try {
        // Fetch comments would go here in a real implementation
        // For now, we're just opening the comments dialog
        setComments([]);
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
      // Add comment would go here in a real implementation
      const newCommentObj = {
        id: Math.random().toString(),
        content: newComment,
        created_at: new Date().toISOString(),
        user_id: user.id,
        profiles: {
          username: user?.user_metadata?.username || 'Unknown user',
          avatar_url: user?.user_metadata?.avatar_url
        }
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment("");
      setCommentsCount(commentsCount + 1);
      
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

  const deletePost = async () => {
    if (!isAuthor) return;
    
    try {
      // If there's media, delete it from storage first
      if (post.url) {
        const urlParts = post.url.split('/');
        const filePath = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];
        await supabase.storage.from('posts').remove([filePath]);
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

  const renderMedia = () => {
    if (!post.url) return null;
    
    switch(post.type) {
      case 'photo':
        return (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={post.url}
              alt="Post"
              className="w-full object-cover max-h-96"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-3 rounded-md overflow-hidden">
            <video 
              src={post.url} 
              controls 
              className="w-full max-h-96"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="mt-3">
            <audio className="w-full" controls src={post.url} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20 hover:bg-audifyx-purple-dark/40 transition-colors">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback>
                {post.profiles?.username[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.profiles?.username}</p>
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
        
        {renderMedia()}
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
          {commentsCount > 0 && <span>{commentsCount}</span>}
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
