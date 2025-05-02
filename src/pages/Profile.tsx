
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

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setIsLoading(false);
  }, [navigate, user]);

  const { data: profile } = useProfile(user?.id);

  if (isLoading || !user) {
    return null;
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
          <ProfileHeader isOwnProfile={true} />
          <ProfileMetrics accountType={user?.user_metadata?.accountType || 'listener'} />
          <div className="px-4">
            <ProfileTabs 
              isOwnProfile={true} 
              accountType={user?.user_metadata?.accountType || 'listener'} 
              userId={user.id} 
            />
          </div>
          {profile && (
            <EditProfileModal open={editOpen} onOpenChange={setEditOpen} profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}
