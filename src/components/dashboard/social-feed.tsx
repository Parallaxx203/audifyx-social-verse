import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Music, Image, PlayCircle, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export function SocialFeed() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [post, setPost] = useState("");
  const [showStories, setShowStories] = useState(true);
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: "demo_user",
      avatar: "/placeholder.svg",
      content: "Just dropped a new track! 🎵 Check it out!",
      mediaType: "audio",
      mediaUrl: "https://example.com/track.mp3",
      likes: 42,
      comments: 8,
      shares: 12,
      isLiked: false,
      timestamp: "2h"
    },
    {
      id: 2,
      username: "artist_official",
      avatar: "/placeholder.svg",
      content: "Live streaming tonight! Don't miss it 🎤",
      mediaType: "image",
      mediaUrl: "/placeholder.svg",
      likes: 156,
      comments: 23,
      shares: 45,
      isLiked: true,
      timestamp: "4h"
    }
  ]);

  const stories = [
    { id: 1, username: "user1", avatar: "/placeholder.svg", hasUnseenStory: true },
    { id: 2, username: "user2", avatar: "/placeholder.svg", hasUnseenStory: true },
    { id: 3, username: "user3", avatar: "/placeholder.svg", hasUnseenStory: false },
  ];

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
    ));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {showStories && (
        <div className="overflow-x-auto py-4">
          <div className="flex gap-4">
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0">
                <div className={`w-16 h-16 rounded-full p-[2px] ${story.hasUnseenStory ? 'bg-gradient-to-tr from-audifyx-purple to-audifyx-blue' : 'bg-gray-700'}`}>
                  <img src={story.avatar} alt={story.username} className="w-full h-full rounded-full object-cover" />
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
            <AvatarFallback>
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="Share your music, thoughts, or updates..."
              value={post}
              onChange={(e) => setPost(e.target.value)}
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
              <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                Post
              </Button>
            </div>
          </div>
        </div>
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