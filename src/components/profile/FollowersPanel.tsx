import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFollowUser } from "@/hooks/useFollowUser";
import { Link } from "react-router-dom";

interface UserItem {
  id: string;
  username: string;
  avatar_url?: string;
  account_type: string;
}

export function FollowersPanel({ userId }: { userId: string }) {
  const [followers, setFollowers] = useState<UserItem[]>([]);
  const [following, setFollowing] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing } = useFollowUser();
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  
  const isOwnProfile = user?.id === userId;
  
  useEffect(() => {
    if (userId) {
      fetchFollowData();
    }
  }, [userId]);
  
  const fetchFollowData = async () => {
    setIsLoading(true);
    try {
      // Fetch followers
      const { data: followerData, error: followerError } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles:follower_id (
            id, username, avatar_url, account_type
          )
        `)
        .eq('following_id', userId);
        
      if (followerError) throw followerError;
      
      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles:following_id (
            id, username, avatar_url, account_type
          )
        `)
        .eq('follower_id', userId);
        
      if (followingError) throw followingError;
      
      // Transform data
      const followersTransformed = followerData.map((item: any) => item.profiles);
      const followingTransformed = followingData.map((item: any) => item.profiles);
      
      setFollowers(followersTransformed);
      setFollowing(followingTransformed);
      
      // Check follow status for each user if viewing own profile
      if (user && isOwnProfile) {
        const statusMap: Record<string, boolean> = {};
        
        for (const followedUser of followingTransformed) {
          statusMap[followedUser.id] = true;
        }
        
        setFollowStatus(statusMap);
      }
      
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      if (followStatus[targetUserId]) {
        await unfollowUser(targetUserId);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: false }));
      } else {
        await followUser(targetUserId);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: true }));
      }
      
      // Refresh data
      fetchFollowData();
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
        <CardHeader>
          <CardTitle>Followers & Following</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          Loading...
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
      <CardHeader>
        <CardTitle>Followers & Following</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers">
            {followers.length > 0 ? (
              <div className="space-y-3">
                {followers.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between p-2 hover:bg-audifyx-purple/10 rounded-md transition-colors">
                    <Link to={`/profile/${follower.username}`} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={follower.avatar_url || ""} />
                        <AvatarFallback>{follower.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{follower.username}</p>
                        <p className="text-xs text-gray-400 capitalize">{follower.account_type}</p>
                      </div>
                    </Link>
                    {user && follower.id !== user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleFollowToggle(follower.id)}
                      >
                        {followStatus[follower.id] ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No followers yet
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following">
            {following.length > 0 ? (
              <div className="space-y-3">
                {following.map((followedUser) => (
                  <div key={followedUser.id} className="flex items-center justify-between p-2 hover:bg-audifyx-purple/10 rounded-md transition-colors">
                    <Link to={`/profile/${followedUser.username}`} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={followedUser.avatar_url || ""} />
                        <AvatarFallback>{followedUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{followedUser.username}</p>
                        <p className="text-xs text-gray-400 capitalize">{followedUser.account_type}</p>
                      </div>
                    </Link>
                    {isOwnProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleFollowToggle(followedUser.id)}
                      >
                        Unfollow
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Not following anyone yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
