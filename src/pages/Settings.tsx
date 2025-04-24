
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTwitchConnection, useTwitchStatus } from "@/hooks/useTwitchConnection";
import { Label } from "@/components/ui/label";
import { MediaUploader } from "@/components/ui/media-uploader";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Form fields
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [twitchUsername, setTwitchUsername] = useState("");
  
  // Twitch integration
  const [twitchConnectLoading, setTwitchConnectLoading] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // Theme settings
  const [darkMode, setDarkMode] = useState(true);
  
  useEffect(() => {
    // Get user info from local storage
    const userInfo = localStorage.getItem("audifyx-user");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      
      // Fetch profile data
      fetchProfile(parsedUser.id);
    }
  }, []);
  
  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setUsername(data.username || "");
        setBio(data.bio || "");
        setWebsite(data.website || "");
        setAvatarUrl(data.avatar_url || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          bio,
          website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleMediaUpload = (url: string, type: "audio" | "video") => {
    if (type === "audio") {
      toast({
        title: "Audio uploaded",
        description: "Your audio file has been uploaded successfully"
      });
    } else {
      toast({
        title: "Video uploaded",
        description: "Your video file has been uploaded successfully"
      });
    }
  };

  // Twitch connection hooks
  const { twitchConnection, isLoading: isTwitchStatusLoading, fetchTwitchConnection } = useTwitchStatus(user?.id || "");
  const { connectTwitch, disconnectTwitch, isConnecting } = useTwitchConnection(user?.id || "");

  const handleTwitchConnect = async () => {
    setTwitchConnectLoading(true);
    try {
      await connectTwitch(twitchUsername);
      setTwitchUsername("");
      fetchTwitchConnection();
    } finally {
      setTwitchConnectLoading(false);
    }
  };

  const handleTwitchDisconnect = async () => {
    setTwitchConnectLoading(true);
    try {
      await disconnectTwitch();
      fetchTwitchConnection();
    } finally {
      setTwitchConnectLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.id) {
      fetchTwitchConnection();
    }
  }, [user?.id]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4 md:p-8`}>
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-audifyx-charcoal/50 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="media">Media Upload</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card className="border-audifyx-purple/20 bg-audifyx-purple-dark/30">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your public profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      className="bg-background/10 border-audifyx-purple/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      className="bg-background/10 border-audifyx-purple/30"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={website} 
                      onChange={(e) => setWebsite(e.target.value)} 
                      className="bg-background/10 border-audifyx-purple/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Profile Picture URL</Label>
                    <Input 
                      id="avatar" 
                      value={avatarUrl} 
                      onChange={(e) => setAvatarUrl(e.target.value)} 
                      className="bg-background/10 border-audifyx-purple/30"
                      placeholder="https://example.com/your-image.jpg"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={updateProfile} 
                    disabled={loading}
                    className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Media Upload */}
            <TabsContent value="media">
              <Card className="border-audifyx-purple/20 bg-audifyx-purple-dark/30">
                <CardHeader>
                  <CardTitle>Media Upload</CardTitle>
                  <CardDescription>
                    Upload audio or video files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Audio Upload</h3>
                    <p className="text-gray-400 mb-4">Upload MP3 files for your music catalog</p>
                    <MediaUploader 
                      onUploadComplete={handleMediaUpload} 
                      allowedTypes="audio" 
                      userId={user.id} 
                    />
                  </div>
                  
                  <div className="pt-6 border-t border-audifyx-purple/20">
                    <h3 className="text-lg font-semibold mb-3">Video Upload</h3>
                    <p className="text-gray-400 mb-4">Upload MP4 files for your video content</p>
                    <MediaUploader 
                      onUploadComplete={handleMediaUpload} 
                      allowedTypes="video" 
                      userId={user.id} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Integrations */}
            <TabsContent value="integrations">
              <Card className="border-audifyx-purple/20 bg-audifyx-purple-dark/30">
                <CardHeader>
                  <CardTitle>Platform Integrations</CardTitle>
                  <CardDescription>
                    Connect your Audifyx account to external platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 mb-4 border-audifyx-purple/30 bg-background/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Twitch Integration</h3>
                        <p className="text-sm text-gray-400">
                          {twitchConnection ? "Currently connected as:" : "Connect your Twitch account for live streaming"}
                        </p>
                        {twitchConnection && (
                          <p className="text-audifyx-purple font-semibold mt-1">
                            {twitchConnection.twitch_username}
                          </p>
                        )}
                      </div>
                      {twitchConnection ? (
                        <Button 
                          onClick={handleTwitchDisconnect} 
                          variant="destructive"
                          disabled={twitchConnectLoading}
                        >
                          {twitchConnectLoading ? "Disconnecting..." : "Disconnect"}
                        </Button>
                      ) : (
                        <Button 
                          disabled={twitchConnectLoading || !twitchUsername}
                          onClick={handleTwitchConnect}
                          className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                        >
                          {twitchConnectLoading ? "Connecting..." : "Connect"}
                        </Button>
                      )}
                    </div>
                    
                    {!twitchConnection && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter Twitch username"
                          value={twitchUsername}
                          onChange={(e) => setTwitchUsername(e.target.value)}
                          className="bg-background/10 border-audifyx-purple/30"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Future integrations */}
                  <div className="border rounded-lg p-4 border-audifyx-purple/30 bg-background/10 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Spotify Integration</h3>
                        <p className="text-sm text-gray-400">Connect your Spotify account</p>
                      </div>
                      <Button 
                        disabled 
                        variant="outline" 
                        className="border-audifyx-purple/30"
                      >
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notifications */}
            <TabsContent value="notifications">
              <Card className="border-audifyx-purple/20 bg-audifyx-purple-dark/30">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-400">Receive updates and alerts via email</p>
                    </div>
                    <Switch 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-audifyx-purple/20">
                    <div>
                      <h3 className="font-medium">In-App Notifications</h3>
                      <p className="text-sm text-gray-400">Receive notifications within the app</p>
                    </div>
                    <Switch 
                      checked={inAppNotifications}
                      onCheckedChange={setInAppNotifications}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Appearance */}
            <TabsContent value="appearance">
              <Card className="border-audifyx-purple/20 bg-audifyx-purple-dark/30">
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how Audifyx looks for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-gray-400">Toggle between light and dark theme</p>
                    </div>
                    <Switch 
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
