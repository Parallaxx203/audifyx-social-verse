
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwitchEmbed } from "@/components/twitch/TwitchEmbed";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Image, User, MessageSquare } from "lucide-react";
import { UploadPostModal } from "@/components/creator/UploadPostModal";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
  media_url?: string;
}

export default function SocialRoom() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Fetch posts with user information
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Format data to include username and avatar_url at the top level
      const formattedData = data.map((post) => ({
        ...post,
        username: post.profiles?.username || 'Unknown User',
        avatar_url: post.profiles?.avatar_url || '',
      }));

      setPosts(formattedData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!postContent.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: postContent,
          user_id: user.id,
        });

      if (error) throw error;
      
      // Clear input and refresh posts
      setPostContent("");
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Social Room</h1>
              <UploadPostModal />
            </div>
            
            <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <TabsTrigger value="feed">Social Feed</TabsTrigger>
                <TabsTrigger value="twitch">Twitch</TabsTrigger>
                <TabsTrigger value="chat">Live Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="mt-6">
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 mb-6">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="relative">
                          <Input
                            placeholder="What's happening?"
                            className="bg-audifyx-purple-dark/70 border-audifyx-purple/30 min-h-[80px] text-white pr-10"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleCreatePost();
                              }
                            }}
                          />
                          <Button 
                            size="icon"
                            className="absolute right-2 bottom-2 bg-audifyx-purple hover:bg-audifyx-purple-vivid rounded-full"
                            onClick={handleCreatePost}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-end mt-2 gap-2">
                          <Button variant="outline" size="sm">
                            <Image className="h-4 w-4 mr-1" /> Media
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Posts Feed */}
                <div className="space-y-4">
                  {isLoading ? (
                    <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 p-6 text-center">
                      Loading posts...
                    </Card>
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <Card key={post.id} className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                        <CardContent className="pt-6">
                          <div className="flex gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.avatar_url} />
                              <AvatarFallback>{post.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold">{post.username}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(post.created_at).toLocaleDateString()}
                              </p>
                              <div className="mt-2">{post.content}</div>
                              {post.media_url && (
                                <div className="mt-3">
                                  <img src={post.media_url} alt="Post media" className="rounded-md max-h-96 w-auto" />
                                </div>
                              )}
                              <div className="flex gap-6 mt-4">
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  ❤️ Like
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <MessageSquare className="h-4 w-4 mr-1" /> Comment
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  🔁 Repost
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 p-6 text-center">
                      No posts yet. Be the first to post!
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="twitch" className="mt-6">
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>@para1laxx's Twitch Stream</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video">
                      <TwitchEmbed channel="para1laxx" height="100%" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="chat" className="mt-6">
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>Live Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col h-[60vh]">
                      <div className="flex-grow bg-audifyx-charcoal/30 rounded-md p-4 mb-4 overflow-y-auto">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                            <div className="bg-audifyx-purple/20 p-3 rounded-lg">
                              <p className="font-bold text-sm">SoundWave</p>
                              <p>Hey everyone! Who's listening to the new track?</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>B</AvatarFallback>
                            </Avatar>
                            <div className="bg-audifyx-purple/20 p-3 rounded-lg">
                              <p className="font-bold text-sm">BeatMaster</p>
                              <p>That new drop is 🔥</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <div className="bg-audifyx-purple/50 p-3 rounded-lg">
                              <p>I'm loving the bass line!</p>
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.user_metadata?.avatar_url} />
                              <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Type your message..." 
                          className="bg-audifyx-purple-dark/70 border-audifyx-purple/30 text-white"
                        />
                        <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
