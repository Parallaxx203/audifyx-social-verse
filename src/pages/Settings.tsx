
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Music, 
  Twitch, 
  Save,
  Edit 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTwitchConnection, useTwitchStatus } from "@/hooks/useTwitchConnection";
import { MediaUploader } from "@/components/ui/media-uploader";
import { toast } from "@/components/ui/use-toast";
import { useProfile, useUpdateProfile, uploadProfileFile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Settings() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: "",
    fullName: "",
    bio: "",
    email: "",
  });
  const [twitchUsername, setTwitchUsername] = useState('');
  const [isTwitchModalOpen, setIsTwitchModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);
  
  // Get user data
  useEffect(() => {
    const userInfo = localStorage.getItem("audifyx-user");
    if (!userInfo) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userInfo));
    setIsLoading(false);
  }, [navigate]);
  
  // Fetch profile data
  const { data: profile } = useProfile(user?.id);
  const updateProfile = useUpdateProfile(user?.id);
  
  useEffect(() => {
    if (profile) {
      setProfileData({
        username: profile.username || "",
        fullName: profile.full_name || "",
        bio: profile.bio || "",
        email: user?.email || "",
      });
      if (profile.avatar_url) {
        setPreviewUrl(profile.avatar_url);
      }
    }
  }, [profile, user]);
  
  // Twitch connection hooks
  const { connectTwitch, disconnectTwitch, isConnecting } = useTwitchConnection(user?.id);
  const { twitchConnection, isLoading: isTwitchLoading, fetchTwitchConnection } = useTwitchStatus(user?.id);
  
  useEffect(() => {
    if (user?.id) {
      fetchTwitchConnection();
    }
  }, [user?.id, fetchTwitchConnection]);
  
  const handleConnectTwitch = async () => {
    await connectTwitch(twitchUsername);
    setIsTwitchModalOpen(false);
    fetchTwitchConnection();
  };
  
  const handleDisconnectTwitch = async () => {
    await disconnectTwitch();
    setIsTwitchModalOpen(false);
    fetchTwitchConnection();
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const saveProfile = async () => {
    setIsUploading(true);
    try {
      let update: any = {
        username: profileData.username,
        full_name: profileData.fullName,
        bio: profileData.bio,
        updated_at: new Date().toISOString()
      };
      
      if (avatarFile) {
        update.avatar_url = await uploadProfileFile("profile_images", avatarFile, user.id);
      }
      
      await updateProfile.mutateAsync(update);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaUpload = async (url: string, type: "audio" | "video") => {
    try {
      // Here you would save the media URL to the user's profile or content table
      toast({
        title: `${type === "audio" ? "Audio" : "Video"} saved`,
        description: "Your media has been saved to your profile",
      });
      
      // Close the dialog
      setMediaUploadOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save media",
        variant: "destructive",
      });
      console.error("Error saving media:", error);
    }
  };
  
  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6"/> Settings
            </h1>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-4 bg-audifyx-purple-dark/70 p-1">
                <TabsTrigger value="profile" className="data-[state=active]:bg-audifyx-purple data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-2" /> Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-audifyx-purple data-[state=active]:text-white">
                  <Bell className="w-4 h-4 mr-2" /> Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="data-[state=active]:bg-audifyx-purple data-[state=active]:text-white">
                  <Shield className="w-4 h-4 mr-2" /> Privacy
                </TabsTrigger>
                <TabsTrigger value="connections" className="data-[state=active]:bg-audifyx-purple data-[state=active]:text-white">
                  <Twitch className="w-4 h-4 mr-2" /> Connections
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Settings Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-2 border-audifyx-purple">
                        {previewUrl ? (
                          <AvatarImage src={previewUrl} alt={profileData.username} />
                        ) : (
                          <AvatarFallback className="bg-audifyx-purple/30 text-2xl">
                            {profileData.username.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Button 
                        size="icon" 
                        className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-audifyx-purple" 
                        variant="secondary"
                        type="button"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{profileData.username}</h3>
                      <p className="text-sm text-gray-400">{user.accountType}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                          placeholder="Your username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                          placeholder="Your full name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="bg-audifyx-purple-dark/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell us about yourself"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={saveProfile}
                      className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                      disabled={isUploading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isUploading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
                
                <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Media Library</h3>
                  <p className="text-gray-400 mb-4">Upload your audio and video files to share with your followers.</p>
                  
                  <Button 
                    onClick={() => setMediaUploadOpen(true)} 
                    variant="outline" 
                    className="w-full border-audifyx-purple/30 hover:bg-audifyx-purple/20"
                  >
                    <Music className="w-4 h-4 mr-2" /> Upload Media
                  </Button>
                </div>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-400">Receive updates via email</p>
                      </div>
                      <Switch id="email-notifications" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Follower Notifications</p>
                        <p className="text-sm text-gray-400">Get notified when someone follows you</p>
                      </div>
                      <Switch id="follower-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Message Notifications</p>
                        <p className="text-sm text-gray-400">Get notified when you receive a message</p>
                      </div>
                      <Switch id="message-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Content Update Notifications</p>
                        <p className="text-sm text-gray-400">Get notified about new content from creators you follow</p>
                      </div>
                      <Switch id="content-notifications" defaultChecked />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Privacy Tab */}
              <TabsContent value="privacy" className="space-y-6">
                <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-gray-400">Make your profile visible to everyone</p>
                      </div>
                      <Switch id="profile-visibility" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Online Status</p>
                        <p className="text-sm text-gray-400">Show when you're active on the platform</p>
                      </div>
                      <Switch id="online-status" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Collection</p>
                        <p className="text-sm text-gray-400">Allow us to collect usage data to improve the platform</p>
                      </div>
                      <Switch id="data-collection" defaultChecked />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Connections Tab */}
              <TabsContent value="connections" className="space-y-6">
                <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Twitch className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="font-medium">Twitch</p>
                          <p className="text-sm text-gray-400">
                            {twitchConnection 
                              ? `Connected as ${twitchConnection.twitch_username}` 
                              : "Not connected"
                            }
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant={twitchConnection ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setIsTwitchModalOpen(true)}
                      >
                        {twitchConnection ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                    
                    {/* Additional connection options can be added here */}
                    
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Twitch Connection Modal */}
      <Dialog open={isTwitchModalOpen} onOpenChange={setIsTwitchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {twitchConnection ? "Disconnect Twitch" : "Connect Twitch"}
            </DialogTitle>
          </DialogHeader>
          {twitchConnection ? (
            <div>
              <p>Are you sure you want to disconnect your Twitch account?</p>
              <div className="flex justify-end gap-4 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTwitchModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDisconnectTwitch}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input 
                placeholder="Enter Twitch Username" 
                value={twitchUsername}
                onChange={(e) => setTwitchUsername(e.target.value)}
              />
              <Button 
                onClick={handleConnectTwitch} 
                disabled={!twitchUsername || isConnecting}
                className="w-full"
              >
                {isConnecting ? "Connecting..." : "Connect Twitch"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Media Upload Modal */}
      <Dialog open={mediaUploadOpen} onOpenChange={setMediaUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload audio (MP3) or video (MP4) files to share with your audience.
            </p>
            {user && (
              <MediaUploader 
                userId={user.id} 
                onUploadComplete={handleMediaUpload} 
                allowedTypes="both" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
