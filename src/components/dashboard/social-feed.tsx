
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePost } from "@/components/dashboard/create-post";
import { SocialFeedPost } from "@/components/dashboard/social-feed-post";
import { useAuth } from "@/contexts/AuthContext";

// Updated to match the new schema with posts and media
interface Post {
  id: string;
  content: string;
  image_url?: string;
  audio_url?: string;
  created_at: string;
  user_id: string;
  likes_count?: number;
  comments_count?: number;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();

    // Set up subscription for new posts
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
      }, () => {
        fetchPosts();
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'posts',
      }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // First query the existing posts table
      const { data: oldPosts, error: oldPostsError } = await supabase
        .from('posts')
        .select(`
          id, 
          content, 
          image_url,
          audio_url,
          created_at,
          user_id,
          likes_count,
          comments_count,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (oldPostsError) throw oldPostsError;

      // Then query the new posts table with media
      const { data: newPosts, error: newPostsError } = await supabase
        .from('posts')
        .select(`
          id, 
          caption as content,
          url,
          type,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (newPostsError) throw newPostsError;

      // Combine and format the posts
      const formattedNewPosts = (newPosts || []).map(post => {
        const formattedPost: Post = {
          id: post.id,
          content: post.content || "",
          created_at: post.created_at,
          user_id: post.user_id,
          profiles: post.profiles,
          likes_count: 0,
          comments_count: 0
        };
        
        // Set the appropriate URL based on media type
        if (post.type === 'photo') {
          formattedPost.image_url = post.url;
        } else if (post.type === 'audio') {
          formattedPost.audio_url = post.url;
        }
        
        return formattedPost;
      });

      // Combine old and new posts, sort by creation date
      const combinedPosts = [...(oldPosts || []), ...formattedNewPosts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setPosts(combinedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-[120px] w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && <CreatePost onPostCreated={handlePostCreated} />}
      
      {posts.length > 0 ? (
        posts.map(post => (
          <SocialFeedPost 
            key={post.id} 
            post={post} 
            onPostDeleted={fetchPosts}
          />
        ))
      ) : (
        <p className="text-center text-gray-400 py-6">
          No posts yet. Be the first to post something!
        </p>
      )}
    </div>
  );
}
