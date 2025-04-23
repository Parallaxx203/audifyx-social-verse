
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileMetrics } from "@/components/profile/profile-metrics";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem("audifyx-user");
    if (!userInfo) {
      navigate("/");
      return;
    }
    
    setUser(JSON.parse(userInfo));
    setIsLoading(false);
  }, [navigate]);
  
  if (isLoading || !user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8`}>
          {/* Profile Header */}
          <ProfileHeader isOwnProfile={true} />
          
          {/* Profile Metrics */}
          <ProfileMetrics accountType={user.accountType} />
          
          {/* Profile Tabs */}
          <div className="px-4">
            <ProfileTabs isOwnProfile={true} accountType={user.accountType} />
          </div>
        </main>
      </div>
    </div>
  );
}
