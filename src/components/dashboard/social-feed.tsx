
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, Share2, PlusCircle, Video, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "react-router-dom";

export function SocialFeed() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [post, setPost] = useState("");
  const [stories, setStories] = useState([
    { id: 1, username: 'user1', avatar: 'https://github.com/shadcn.png' },
    { id: 2, username: 'user2', avatar: 'https://github.com/shadcn.png' },
    // Add more mock stories
  ]);

  return (
    <div className="space-y-6">
      {/* Stories Section */}
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex p-4 gap-4">
          <div className="flex flex-col items-center">
            <Button size="icon" className="rounded-full h-16 w-16 bg-muted hover:bg-muted-foreground">
              <PlusCircle className="h-8 w-8" />
            </Button>
            <span className="text-xs mt-2">Add Story</span>
          </div>
          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center">
              <Avatar className="h-16 w-16 ring-2 ring-primary cursor-pointer">
                <Avatar.Image src={story.avatar} alt={story.username} />
              </Avatar>
              <span className="text-xs mt-2">{story.username}</span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Create Post */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <Avatar.Image src={profile?.avatar_url} alt={profile?.username} />
          </Avatar>
          <div className="flex-1">
            <Input 
              placeholder="What's on your mind?"
              value={post}
              onChange={(e) => setPost(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button size="sm" variant="outline">
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
              <Button size="sm" className="ml-auto">Post</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Feed Posts */}
      <div className="space-y-4">
        {/* Example post */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <Avatar.Image src="https://github.com/shadcn.png" alt="User" />
            </Avatar>
            <Link to="/profile/user1" className="font-semibold hover:underline">
              username
            </Link>
          </div>
          <p className="mb-4">This is a sample post</p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              42
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              12
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
