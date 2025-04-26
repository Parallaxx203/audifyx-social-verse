
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTwitchConnection, useTwitchStatus } from "@/hooks/useTwitchConnection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Save, Twitch, Globe, Mail, User, Shield } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [twitchUsername, setTwitchUsername] = useState("");
  const { toast } = useToast();
  const { connectTwitch, disconnectTwitch, isConnecting } = useTwitchConnection(user?.id || "");
  const { twitchConnection, fetchTwitchConnection } = useTwitchStatus(user?.id || "");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    }
  };

  const handleTwitchConnect = async () => {
    if (!twitchUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your Twitch username",
        variant: "destructive"
      });
      return;
    }

    const result = await connectTwitch(twitchUsername);
    if (result) {
      fetchTwitchConnection();
      toast({
        title: "Success",
        description: "Twitch account connected successfully"
      });
    }
  };

  const handleTwitchDisconnect = async () => {
    const result = await disconnectTwitch();
    if (result) {
      fetchTwitchConnection();
      toast({
        title: "Success",
        description: "Twitch account disconnected successfully"
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gradient">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-audifyx-purple-dark/30">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> Connections
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="border-audifyx-purple/20 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Profile Information</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? (
                    <Save className="w-4 h-4 mr-2" />
                  ) : (
                    <Pencil className="w-4 h-4 mr-2" />
                  )}
                  {editing ? "Save" : "Edit"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                  <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label>Profile Picture</Label>
                  <MediaUploader 
                    onUploadComplete={(url) => {
                      setProfile({ ...profile, avatar_url: url });
                    }}
                    allowedTypes="both"
                    userId={user?.id || ""}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={profile?.username || ''} 
                    disabled={!editing}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="bg-audifyx-charcoal/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-audifyx-charcoal/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={profile?.bio || ''} 
                    disabled={!editing}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="bg-audifyx-charcoal/50"
                  />
                </div>
              </div>

              {editing && (
                <Button 
                  onClick={handleUpdateProfile}
                  className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                >
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="mt-6">
          <Card className="border-audifyx-purple/20 bg-gradient-card">
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-audifyx-charcoal/40 rounded-lg">
                <div className="flex items-center gap-4">
                  <Twitch className="w-6 h-6 text-[#6441a5]" />
                  <div>
                    <h3 className="font-medium">Twitch</h3>
                    <p className="text-sm text-gray-400">
                      {twitchConnection ? `Connected as ${twitchConnection.twitch_username}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                {!twitchConnection ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Twitch username"
                      value={twitchUsername}
                      onChange={(e) => setTwitchUsername(e.target.value)}
                      className="bg-audifyx-charcoal/50"
                    />
                    <Button 
                      onClick={handleTwitchConnect}
                      disabled={isConnecting}
                      className="bg-[#6441a5] hover:bg-[#7d5bbe]"
                    >
                      Connect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="destructive"
                    onClick={handleTwitchDisconnect}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="border-audifyx-purple/20 bg-gradient-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card className="border-audifyx-purple/20 bg-gradient-card">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Privacy settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
