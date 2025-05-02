
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Grid, Music, Users, Settings } from "lucide-react";
import { FollowersPanel } from "@/components/profile/FollowersPanel";
import { TwitchIntegrationPanel } from "@/components/profile/TwitchIntegrationPanel";
import { UploadPostModal } from "@/components/creator/UploadPostModal";
import { useAuth } from "@/contexts/AuthContext";
import { UploadTrackModal } from "@/components/creator/UploadTrackModal";

interface ProfileTabsProps {
  isOwnProfile?: boolean;
  accountType?: string;
  userId?: string; // Optional userId
}

export function ProfileTabs({ isOwnProfile = true, accountType = "listener", userId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const { user } = useAuth();
  
  // When isOwnProfile is true, use the current user's ID
  const profileUserId = isOwnProfile ? user?.id : userId;

  return (
    <Tabs 
      defaultValue={activeTab} 
      onValueChange={setActiveTab}
      className="w-full mt-6"
    >
      <TabsList className="w-full grid grid-cols-4 bg-audifyx-purple-dark/30">
        <TabsTrigger value="posts" className="flex items-center gap-2">
          <Grid className="h-4 w-4" /> Posts
        </TabsTrigger>
        <TabsTrigger value="tracks" className="flex items-center gap-2">
          <Music className="h-4 w-4" /> Tracks
        </TabsTrigger>
        <TabsTrigger value="following" className="flex items-center gap-2">
          <Users className="h-4 w-4" /> Network
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" /> Settings
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-6">
        {isOwnProfile && (
          <div className="mb-4">
            <UploadPostModal />
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-audifyx-purple-dark/60 rounded-md flex items-center justify-center text-gray-400">
              No posts yet
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="tracks" className="mt-6">
        {isOwnProfile && (accountType === "creator" || accountType === "brand") && (
          <div className="mb-4">
            <UploadTrackModal />
          </div>
        )}
        
        <div className="space-y-4">
          {accountType === "creator" ? (
            <Card className="p-4 border-audifyx-purple/20 bg-gradient-card flex items-center justify-center text-gray-400 h-32">
              No tracks uploaded yet
            </Card>
          ) : (
            <Card className="p-4 border-audifyx-purple/20 bg-gradient-card">
              <div className="text-center text-gray-400">
                This user hasn't uploaded any tracks
              </div>
            </Card>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="following" className="mt-6">
        <FollowersPanel userId={profileUserId || ""} />
      </TabsContent>
      
      <TabsContent value="settings" className="mt-6 space-y-6">
        {isOwnProfile ? (
          <>
            <Card className="p-6 border-audifyx-purple/20 bg-gradient-card">
              <h3 className="text-xl font-bold mb-4">Profile Settings</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start border-audifyx-purple/30">
                  Connect Social Accounts
                </Button>
                <Button variant="outline" className="w-full justify-start border-audifyx-purple/30">
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start border-audifyx-purple/30">
                  Notification Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start border-audifyx-purple/30">
                  Account Information
                </Button>
              </div>
            </Card>
            
            {/* Only show Twitch integration for creators */}
            {accountType === "creator" && user?.id && (
              <TwitchIntegrationPanel />
            )}
          </>
        ) : (
          <Card className="p-4 border-audifyx-purple/20 bg-gradient-card">
            <div className="text-center text-gray-400">
              Only the profile owner can view settings
            </div>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
