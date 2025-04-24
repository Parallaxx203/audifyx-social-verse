
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  // Temporary mock data - replace with real API calls
  useEffect(() => {
    setPosts([
      {
        id: 1,
        username: "musicCreator",
        content: "Just dropped a new track! Check it out 🎵",
        likes: 42,
        comments: 8,
        isLiked: false
      },
      // Add more mock posts here
    ]);
  }, []);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
    ));
  };

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <Card key={post.id} className="border-audifyx-purple/20 bg-gradient-to-br from-audifyx-purple/20 to-audifyx-blue/20">
          <CardContent className="p-4">
            <Link to={`/profile/${post.username}`} className="font-bold hover:text-audifyx-purple">
              @{post.username}
            </Link>
            <p className="mt-2">{post.content}</p>
            <div className="flex gap-4 mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleLike(post.id)}
                className={post.isLiked ? "text-audifyx-purple" : ""}
              >
                <Heart className="w-4 h-4 mr-1" />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                {post.comments}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
