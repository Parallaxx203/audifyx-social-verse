import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export function SocialFeed() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [post, setPost] = useState("");

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Textarea 
          placeholder="What's on your mind?"
          value={post}
          onChange={(e) => setPost(e.target.value)}
          className="mb-2"
        />
        <Button>Post</Button>
      </Card>

      <div className="space-y-4">
        {/* Feed posts will go here */}
        <Card className="p-4">
          <p>Welcome to your feed! Posts will appear here.</p>
        </Card>
      </div>
    </div>
  );
}