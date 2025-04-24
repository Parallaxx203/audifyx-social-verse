import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export function SocialFeed() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [post, setPost] = useState("");
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: "demo_user",
      content: "Just dropped a new track! 🎵",
      likes: 42,
      comments: 8,
      isLiked: false
    }
  ]);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
    ));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-audifyx-purple/20">
        <Textarea 
          placeholder="What's on your mind?"
          value={post}
          onChange={(e) => setPost(e.target.value)}
          className="mb-2"
        />
        <Button>Post</Button>
      </Card>

      {posts.map(post => (
        <Card key={post.id} className="p-4 bg-audifyx-purple/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-audifyx-purple/30" />
            <div>
              <p className="font-semibold">@{post.username}</p>
              <p className="text-sm text-gray-400">Just now</p>
            </div>
          </div>
          <p className="mb-4">{post.content}</p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
              <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-audifyx-purple' : ''}`} />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}