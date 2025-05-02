
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Award, Edit } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useProfile } from "@/hooks/useProfile";

interface ProfileHeaderProps {
  isOwnProfile?: boolean;
  userId?: string;
}

export function ProfileHeader({ isOwnProfile = true, userId }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { totalPoints, loading: pointsLoading } = usePoints();
  const { data: profile } = useProfile(userId || user?.id);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const { followUser, unfollowUser, checkFollowStatus } = useFollowUser();
  const [loading, setLoading] = useState(false);
  
  const profileId = userId || user?.id;

  useEffect(() => {
    if (profileId) {
      fetchFollowCounts();
      
      if (user && !isOwnProfile) {
        checkFollowingStatus();
      }
    }
  }, [profileId, user?.id]);
  
  const fetchFollowCounts = async () => {
    try {
      // Get follower count
      const { count: followers, error: followerError } = await supabase
        .from("follows")
        .select("*", { count: 'exact', head: true })
        .eq("following_id", profileId);

      if (followerError) throw followerError;
      
      // Get following count
      const { count: following, error: followingError } = await supabase
        .from("follows")
        .select("*", { count: 'exact', head: true })
        .eq("follower_id", profileId);

      if (followingError) throw followingError;
      
      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error("Error fetching follow counts:", error);
    }
  };
  
  const checkFollowingStatus = async () => {
    if (!user || !profileId || isOwnProfile) return;
    
    const isUserFollowing = await checkFollowStatus(profileId);
    setIsFollowing(isUserFollowing);
  };
  
  const handleFollowToggle = async () => {
    if (!user || !profileId) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profileId);
        setIsFollowing(false);
      } else {
        await followUser(profileId);
        setIsFollowing(true);
      }
      
      // Refresh follow counts
      fetchFollowCounts();
    } catch (error) {
      console.error("Error toggling follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultBanner = () => {
    // Return gradient background if no banner image
    return (
      <div className="w-full h-40 bg-gradient-to-r from-audifyx-purple/80 to-audifyx-blue/80 flex items-center justify-center">
        <div className="text-white/50 text-lg">
          {isOwnProfile ? "Add a banner image" : "No banner added"}
        </div>
      </div>
    );
  };

  const getDefaultAvatar = () => {
    // Return placeholder if no profile image
    const firstLetter = profile?.username?.charAt(0).toUpperCase() || 'A';
    return (
      <div className="w-24 h-24 bg-audifyx-purple-dark rounded-full flex items-center justify-center text-3xl text-white border-4 border-audifyx-charcoal">
        {firstLetter}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative">
        {profile?.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Profile banner"
            className="w-full h-40 object-cover"
          />
        ) : (
          getDefaultBanner()
        )}

        {isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/30 hover:bg-black/40 text-white"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Profile picture + info */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Profile picture */}
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-24 h-24 rounded-full border-4 border-audifyx-charcoal object-cover"
              />
            ) : (
              getDefaultAvatar()
            )}

            {isOwnProfile && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 bg-black/30 hover:bg-black/40 text-white rounded-full h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Profile info */}
          <div className="flex-1 pb-4">
            <div className="flex items-end justify-between w-full">
              <div>
                <h1 className="text-2xl font-bold">{profile?.username}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="px-4 py-2 bg-audifyx-purple/20 rounded-full flex items-center gap-2">
                    <Award className="w-4 h-4 text-audifyx-purple" />
                    <span className="font-bold text-audifyx-purple">
                      {isOwnProfile ? (pointsLoading ? "..." : totalPoints) : (profile?.points || 0)} Points
                    </span>
                  </div>
                  <span>{followerCount} Followers</span>
                  <span>{followingCount} Following</span>
                  <span className="capitalize">{profile?.account_type || "user"}</span>
                </div>
              </div>

              {isOwnProfile ? (
                <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  className={isFollowing ? "bg-audifyx-charcoal hover:bg-audifyx-charcoal/80" : "bg-audifyx-purple hover:bg-audifyx-purple-vivid"}
                  onClick={handleFollowToggle}
                  disabled={loading}
                >
                  {loading ? "Processing..." : (isFollowing ? "Unfollow" : "Follow")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 text-gray-300 text-sm">
          {profile?.bio ? (
            <p>{profile.bio}</p>
          ) : (
            <p className="text-gray-500 italic">
              {isOwnProfile ? "No bio yet. Edit your profile." : "No bio available."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
