
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialFeedPost } from "@/components/dashboard/social-feed-post";
import { useAuth } from "@/contexts/AuthContext";
import { UploadPostModal } from "@/components/creator/UploadPostModal";
import { CreatePost } from "@/components/dashboard/create-post";

interface Post {
  id: string;
  content: string;
  type?: string;
  url?: string;
  created_at: string;
  user_id: string;
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
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, 
          content, 
          type,
          url,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Process and type-check data before setting state
      const typedPosts: Post[] = data?.map(post => ({
        id: post.id,
        content: post.content,
        type: post.type,
        url: post.url,
        created_at: post.created_at,
        user_id: post.user_id,
        profiles: post.profiles || { username: 'Unknown User', avatar_url: '' }
      })) || [];
      
      setPosts(typedPosts);
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
      {user && (
        <CreatePost onPostCreated={handlePostCreated} />
      )}
      
      {posts.length > 0 ? (
        posts.map(post => (
          <SocialFeedPost 
            key={post.id} 
            post={post as any} 
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
