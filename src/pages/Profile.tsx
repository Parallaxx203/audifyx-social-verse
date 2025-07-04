
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileMetrics } from "@/components/profile/profile-metrics";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfile } from "@/hooks/useProfile";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFollowUser } from "@/hooks/useFollowUser";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const isMobile = useIsMobile();
  const { checkFollowStatus } = useFollowUser();
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setIsLoading(false);
    
    // Load follower counts when user is available
    if (user.id) {
      loadFollowCounts(user.id);
    }
  }, [navigate, user]);

  // Load follower and following counts
  const loadFollowCounts = async (userId: string) => {
    try {
      const { followerCount, followingCount } = await checkFollowStatus(userId);
      setFollowerCount(followerCount);
      setFollowingCount(followingCount);
    } catch (error) {
      console.error("Error loading follow counts:", error);
    }
  };

  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  if (isLoading || profileLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-audifyx text-white flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8`}>
          <div className="flex justify-end px-4 mt-4">
            <Button
              variant="outline"
              className="border-audifyx-purple/30"
              onClick={() => setEditOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
          
          {profile && (
            <>
              <ProfileHeader 
                userId={profile.id}
                username={profile.username}
                avatarUrl={profile.avatar_url}
                isOwnProfile={true}
                followers={followerCount}
                following={followingCount}
                joinedDate={profile.created_at}
                role={profile.account_type}
                bio={profile.bio}
              />
              
              <ProfileMetrics accountType={profile.account_type || 'listener'} />
              
              <div className="px-4">
                <ProfileTabs 
                  isOwnProfile={true} 
                  accountType={profile.account_type || 'listener'} 
                  userId={user.id} 
                />
              </div>
              
              <EditProfileModal 
                open={editOpen} 
                onOpenChange={setEditOpen} 
                profile={profile} 
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
