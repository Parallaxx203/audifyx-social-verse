import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { Music, Users, Star, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFollowUser } from "@/hooks/useFollowUser";

export default function ViewProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [trackCount, setTrackCount] = useState(0);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { data: profile } = useProfile(profileUser?.id);
  const { followUser, unfollowUser, checkFollowStatus, loading: followLoading } = useFollowUser();

  useEffect(() => {
    fetchUserByUsername();
  }, [username]);
  
  useEffect(() => {
    if (profileUser?.id && currentUser?.id) {
      checkIsFollowing();
      fetchFollowerCount();
      fetchFollowingCount();
      fetchTrackCount();
    }
  }, [profileUser?.id, currentUser?.id]);

  const fetchUserByUsername = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setProfileUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowerCount = async () => {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileUser.id);
        
      if (error) throw error;
      setFollowerCount(count || 0);
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  const fetchFollowingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileUser.id);
        
      if (error) throw error;
      setFollowingCount(count || 0);
    } catch (error) {
      console.error('Error fetching following count:', error);
    }
  };
  
  const fetchTrackCount = async () => {
    try {
      const { count, error } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileUser.id);
        
      if (error) throw error;
      setTrackCount(count || 0);
    } catch (error) {
      console.error('Error fetching track count:', error);
    }
  };

  const checkIsFollowing = async () => {
    if (!profileUser?.id || !currentUser?.id) return;
    const status = await checkFollowStatus(profileUser.id);
    setIsFollowing(status);
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to follow users",
        variant: "destructive"
      });
      return;
    }

    if (isFollowing) {
      const success = await unfollowUser(profileUser.id);
      if (success) {
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      }
    } else {
      const success = await followUser(profileUser.id);
      if (success) {
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-audifyx text-white flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-audifyx text-white flex items-center justify-center">
        <div>User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4 md:p-8`}>
          <div className="mb-8">
            <div className="relative">
              <div className="h-48 bg-gradient-to-r from-audifyx-purple to-audifyx-blue rounded-lg" />
              <div className="absolute -bottom-12 left-8">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={profileUser.avatar_url} />
                  <AvatarFallback>{profileUser.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="mt-16 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">@{profileUser.username}</h1>
                <p className="text-gray-400">{profileUser.bio || "No bio yet"}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={isFollowing 
                    ? "bg-audifyx-purple/20 hover:bg-audifyx-purple/30" 
                    : "bg-audifyx-purple hover:bg-audifyx-purple-vivid"}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-audifyx-purple/30"
                  onClick={() => navigate(`/messages?user=${profileUser.username}`)}
                >
                  Message
                </Button>
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{followerCount} followers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{followingCount} following</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>{trackCount} tracks</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="tracks">
            <TabsList className="bg-audifyx-purple-dark/50">
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackCount > 0 ? (
                  <UserTracks userId={profileUser.id} />
                ) : (
                  <div className="text-center py-10 text-gray-400 col-span-2">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No tracks yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <div className="space-y-4">
                <UserPosts userId={profileUser.id} />
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <Card className="bg-audifyx-purple-dark/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">About</h3>
                  <p className="text-gray-300 mb-4">
                    {profileUser.bio || "No bio provided."}
                  </p>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400">Joined:</span> 
                      {new Date(profileUser.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    {profileUser.website && (
                      <p className="flex items-center gap-2">
                        <span className="text-gray-400">Website:</span> 
                        <a 
                          href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} 
                          className="text-audifyx-purple hover:underline"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {profileUser.website}
                        </a>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Component for displaying user tracks
const UserTracks = ({ userId }: { userId: string }) => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTracks();
  }, [userId]);
  
  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading tracks...</div>;
  }
  
  if (tracks.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 col-span-2">
        <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>No tracks yet</p>
      </div>
    );
  }
  
  return (
    <>
      {tracks.map((track) => (
        <Card key={track.id} className="bg-audifyx-purple-dark/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-audifyx-purple/30 rounded-lg flex items-center justify-center">
                {track.cover_url ? (
                  <img 
                    src={track.cover_url} 
                    alt={track.title} 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                ) : (
                  <Music className="w-8 h-8" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{track.title}</h3>
                <p className="text-sm text-gray-400">
                  {track.play_count} plays • 
                  {new Date(track.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

// Component for displaying user posts
const UserPosts = ({ userId }: { userId: string }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPosts();
  }, [userId]);
  
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading posts...</div>;
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>No posts yet</p>
      </div>
    );
  }
  
  return (
    <>
      {posts.map((post) => (
        <Card key={post.id} className="bg-audifyx-purple-dark/30">
          <CardContent className="p-4">
            <p>{post.content}</p>
            {post.image_url && (
              <div className="mt-3">
                <img 
                  src={post.image_url} 
                  alt="Post" 
                  className="rounded-lg max-h-60 w-auto" 
                />
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <Button variant="ghost" size="sm">Like</Button>
              <Button variant="ghost" size="sm">Comment</Button>
              <Button variant="ghost" size="sm">Share</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
