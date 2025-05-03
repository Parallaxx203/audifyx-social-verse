
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwitchEmbed } from "@/components/twitch/TwitchEmbed";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Image, User, MessageSquare, Heart, Share2, MoreHorizontal } from "lucide-react";
import { UploadPostModal } from "@/components/creator/UploadPostModal";
import { supabase } from "@/integrations/supabase/client";
import { useTwitchStatus } from "@/hooks/useTwitchConnection";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
  media_url?: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  username: string;
  avatar_url?: string;
}

interface LiveChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  avatar?: string;
}

export default function SocialRoom() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("feed");
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentingOnPostId, setCommentingOnPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [showingComments, setShowingComments] = useState<Record<string, boolean>>({});
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [streamers, setStreamers] = useState<{id: string, username: string, twitch_username: string}[]>([]);
  const [selectedStreamer, setSelectedStreamer] = useState<string>("para1laxx");

  const { twitchConnection } = useTwitchStatus(user?.id || '');

  useEffect(() => {
    fetchPosts();
    fetchStreamers();
    
    // Initialize with some sample chat messages
    const initialMessages: LiveChatMessage[] = [
      {
        id: "1",
        userId: "user1",
        username: "SoundWave",
        message: "Hey everyone! Who's listening to the new track?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: "2",
        userId: "user2",
        username: "BeatMaster",
        message: "That new drop is 🔥",
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
      },
      {
        id: "3",
        userId: "user3",
        username: "MelodyMaker",
        message: "I'm working on something similar but with more bass",
        timestamp: new Date(Date.now() - 1000 * 60),
      }
    ];
    
    setChatMessages(initialMessages);
  }, []);

  const fetchStreamers = async () => {
    try {
      const { data, error } = await supabase
        .from('twitch_connections')
        .select(`
          user_id,
          twitch_username,
          profiles:user_id (username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData = data.map(item => ({
          id: item.user_id,
          username: item.profiles?.username || 'Unknown User',
          twitch_username: item.twitch_username
        }));
        setStreamers(formattedData);
        
        // Set selected streamer if we have valid data
        if (formattedData.length > 0) {
          setSelectedStreamer(formattedData[0].twitch_username);
        } else {
          setSelectedStreamer("para1laxx"); // Default fallback
        }
      }
    } catch (error) {
      console.error('Error fetching streamers:', error);
    }
  };

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
        likes_count: Math.floor(Math.random() * 50), // Sample data
        comments_count: Math.floor(Math.random() * 15), // Sample data
        is_liked: Math.random() > 0.5 // Randomly set liked status for demo
      }));

      setPosts(formattedData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      toast({
        title: "Posted!",
        description: "Your post has been published",
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error posting",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    // Optimistically update the UI
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            is_liked: !isLiked, 
            likes_count: (post.likes_count || 0) + (isLiked ? -1 : 1) 
          } 
        : post
    ));
    
    try {
      // In a real app, you would call an API to like/unlike the post
      toast({
        title: isLiked ? "Post unliked" : "Post liked",
        description: isLiked 
          ? "You've removed your like from this post" 
          : "You've liked this post",
      });
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert the optimistic update
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: isLiked, 
              likes_count: (post.likes_count || 0) - (isLiked ? -1 : 1) 
            } 
          : post
      ));
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  const handleCommentClick = async (postId: string) => {
    setCommentingOnPostId(postId);
    
    if (!showingComments[postId]) {
      try {
        // Fetch comments for this post
        // For demo, we'll use mock data
        const mockComments: Comment[] = [
          {
            id: "1",
            content: "Great post! Love the vibe.",
            user_id: "user1",
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            username: "MusicLover",
          },
          {
            id: "2",
            content: "Can't wait to hear more from you!",
            user_id: "user2", 
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            username: "Beatmaker",
          }
        ];
        
        setComments({
          ...comments,
          [postId]: mockComments
        });
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
    
    // Toggle comments visibility
    setShowingComments({
      ...showingComments,
      [postId]: !showingComments[postId]
    });
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;
    
    try {
      // In a real app, you would save the comment to the database
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentText,
        user_id: user.id,
        created_at: new Date().toISOString(),
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url
      };
      
      // Update local state with new comment
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), newComment]
      });
      
      // Update comment count on the post
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments_count: (post.comments_count || 0) + 1 } 
          : post
      ));
      
      setCommentText('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const handleSharePost = (postId: string) => {
    try {
      // In a real app, you would open a share dialog
      toast({
        title: "Post shared",
        description: "You've shared this post",
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim() || !user) return;
    
    const newMessage: LiveChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
      message: chatMessage,
      timestamp: new Date(),
      avatar: user.user_metadata?.avatar_url
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');
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
                          <Textarea
                            placeholder="What's happening?"
                            className="bg-audifyx-purple-dark/70 border-audifyx-purple/30 min-h-[80px] text-white pr-10 resize-none"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                          />
                          <Button 
                            size="icon"
                            className="absolute right-2 bottom-2 bg-audifyx-purple hover:bg-audifyx-purple-vivid rounded-full"
                            onClick={handleCreatePost}
                            disabled={!postContent.trim()}
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
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-bold">{post.username}</p>
                                  <p className="text-sm text-gray-400">
                                    {new Date(post.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="mt-2">{post.content}</div>
                              
                              {post.media_url && (
                                <div className="mt-3">
                                  <img src={post.media_url} alt="Post media" className="rounded-md max-h-96 w-auto" />
                                </div>
                              )}
                              
                              <div className="flex gap-4 mt-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={`text-gray-400 hover:text-white ${post.is_liked ? 'text-audifyx-purple' : ''}`}
                                  onClick={() => handleLikePost(post.id, post.is_liked || false)}
                                >
                                  <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? 'fill-audifyx-purple' : ''}`} /> 
                                  {post.likes_count || 0}
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-white"
                                  onClick={() => handleCommentClick(post.id)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" /> 
                                  {post.comments_count || 0}
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-white"
                                  onClick={() => handleSharePost(post.id)}
                                >
                                  <Share2 className="h-4 w-4 mr-1" /> 
                                  Share
                                </Button>
                              </div>
                              
                              {/* Comments section */}
                              {showingComments[post.id] && (
                                <div className="mt-4 space-y-3">
                                  <div className="h-px bg-audifyx-purple/20 my-2"></div>
                                  
                                  {/* Comment list */}
                                  {comments[post.id] && comments[post.id].length > 0 ? (
                                    <div className="space-y-3">
                                      {comments[post.id].map(comment => (
                                        <div key={comment.id} className="flex gap-2">
                                          <Avatar className="h-8 w-8">
                                            <AvatarImage src={comment.avatar_url} />
                                            <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
                                          </Avatar>
                                          <div className="bg-audifyx-purple/10 p-2 rounded-lg flex-1">
                                            <div className="flex justify-between">
                                              <p className="text-sm font-semibold">{comment.username}</p>
                                              <p className="text-xs text-gray-400">
                                                {new Date(comment.created_at).toLocaleTimeString()}
                                              </p>
                                            </div>
                                            <p className="text-sm mt-1">{comment.content}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-center text-sm text-gray-400">No comments yet</p>
                                  )}
                                  
                                  {/* Add comment form */}
                                  <div className="flex gap-2 mt-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                                      <AvatarFallback>{user?.user_metadata?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 relative">
                                      <Input
                                        placeholder="Add a comment..."
                                        value={commentingOnPostId === post.id ? commentText : ""}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="bg-audifyx-purple-dark/40 border-audifyx-purple/20 pr-10"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                                            e.preventDefault();
                                            handleAddComment(post.id);
                                          }
                                        }}
                                      />
                                      <Button
                                        size="sm"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 bg-audifyx-purple"
                                        onClick={() => handleAddComment(post.id)}
                                        disabled={!commentText.trim()}
                                      >
                                        <Send className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
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
              
              <TabsContent value="twitch" className="mt-6 space-y-6">
                {twitchConnection ? (
                  <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                    <CardHeader>
                      <CardTitle className="text-xl">Your Twitch Stream</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <TwitchEmbed channel={twitchConnection.twitch_username} height="100%" />
                      </div>
                      <p className="text-center mt-4 text-sm text-gray-400">
                        Streaming as <span className="font-bold">{twitchConnection.twitch_username}</span>
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                    <CardHeader>
                      <CardTitle>Connect Your Twitch Account</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="mb-4">Connect your Twitch account to stream directly on Audifyx</p>
                      <Button className="bg-[#9146FF] hover:bg-[#7d3bea]">Connect to Twitch</Button>
                    </CardContent>
                  </Card>
                )}
                
                {/* Connected Twitch Streamers */}
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>Featured Streamers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {streamers.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {streamers.map((streamer) => (
                            <Button
                              key={streamer.id}
                              variant={selectedStreamer === streamer.twitch_username ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedStreamer(streamer.twitch_username)}
                              className={selectedStreamer === streamer.twitch_username ? "bg-audifyx-purple" : ""}
                            >
                              {streamer.username}
                            </Button>
                          ))}
                          <Button
                            variant={selectedStreamer === "para1laxx" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedStreamer("para1laxx")}
                            className={selectedStreamer === "para1laxx" ? "bg-audifyx-purple" : ""}
                          >
                            para1laxx
                          </Button>
                        </div>
                        
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <TwitchEmbed channel={selectedStreamer} height="100%" />
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <p className="mb-4">No streamers currently connected</p>
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <TwitchEmbed channel="para1laxx" height="100%" />
                        </div>
                      </div>
                    )}
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
                          {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-2 ${msg.userId === user?.id ? 'justify-end' : ''}`}>
                              {msg.userId !== user?.id && (
                                <Avatar className="h-8 w-8">
                                  {msg.avatar ? (
                                    <AvatarImage src={msg.avatar} />
                                  ) : (
                                    <AvatarFallback>{msg.username.charAt(0).toUpperCase()}</AvatarFallback>
                                  )}
                                </Avatar>
                              )}
                              
                              <div className={`max-w-[70%] ${
                                msg.userId === user?.id 
                                  ? 'bg-audifyx-purple/50 ml-auto' 
                                  : 'bg-audifyx-purple/20'
                              } p-3 rounded-lg`}>
                                {msg.userId !== user?.id && (
                                  <p className="font-bold text-sm">{msg.username}</p>
                                )}
                                <p className="break-words">{msg.message}</p>
                                <p className="text-xs text-gray-400 text-right mt-1">
                                  {msg.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                              
                              {msg.userId === user?.id && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                                  <AvatarFallback>
                                    {user?.user_metadata?.username?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Type your message..." 
                          className="bg-audifyx-purple-dark/70 border-audifyx-purple/30 text-white"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && chatMessage.trim()) {
                              e.preventDefault();
                              handleSendChatMessage();
                            }
                          }}
                        />
                        <Button 
                          className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                          onClick={handleSendChatMessage}
                          disabled={!chatMessage.trim()}
                        >
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
