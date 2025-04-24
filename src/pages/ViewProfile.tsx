
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileMetrics } from "@/components/profile/profile-metrics";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";

export default function ViewProfile() {
  const { username } = useParams();
  const isMobile = useIsMobile();
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: profile } = useProfile(username);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Implement actual follow/unfollow logic here
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8`}>
          <div className="flex justify-end px-4 mt-4">
            <Button
              variant={isFollowing ? "outline" : "default"}
              className={isFollowing ? "border-audifyx-purple/30" : "bg-audifyx-purple"}
              onClick={handleFollow}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          </div>
          <ProfileHeader profile={profile} isOwnProfile={false} />
          <ProfileMetrics profile={profile} />
          <div className="px-4">
            <ProfileTabs isOwnProfile={false} profile={profile} />
          </div>
        </main>
      </div>
    </div>
  );
}
