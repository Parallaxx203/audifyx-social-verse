
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks";
import { RoleSwitcher } from "@/components/profile/RoleSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwitchIntegrationPanel } from "@/components/profile/TwitchIntegrationPanel";
import { Profile } from "@/hooks/useProfile";

type AccountType = 'listener' | 'creator' | 'brand';

interface ProfileData extends Partial<Profile> {
  username: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  account_type: AccountType;
}

export default function Settings() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
    account_type: 'listener' as AccountType,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);
  
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      setProfile({
        username: data.username || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
        banner_url: data.banner_url || '',
        account_type: (data.account_type as AccountType) || 'listener',
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProfileUpdate = async () => {
    if (!profile.username) {
      toast({
        title: 'Error',
        description: 'Username is required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          bio: profile.bio,
        })
        .eq('id', user?.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRoleChange = (role: AccountType) => {
    setProfile(prev => ({ ...prev, account_type: role }));
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-audifyx flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="bg-audifyx-purple-dark/50 border border-audifyx-purple/20 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <div className="space-y-6">
                  <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={profile.username}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleProfileUpdate} 
                        disabled={isSaving}
                        className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                    <CardHeader>
                      <CardTitle>Profile Pictures</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <Label>Profile Picture</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-audifyx-purple-dark border border-audifyx-purple/30 flex items-center justify-center overflow-hidden">
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl">{profile.username?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <Button variant="outline">Upload New Image</Button>
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        <Label>Banner Image</Label>
                        <div className="w-full h-32 bg-audifyx-purple-dark border border-audifyx-purple/30 rounded-md flex items-center justify-center overflow-hidden">
                          {profile.banner_url ? (
                            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400">No banner image</span>
                          )}
                        </div>
                        <Button variant="outline">Upload Banner</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="account">
                <div className="space-y-6">
                  <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-lg">Email Address</Label>
                        <p className="text-gray-400 mt-1">{user?.email}</p>
                      </div>
                      
                      <Button variant="outline">Change Password</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                    <CardHeader>
                      <CardTitle>Account Mode</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium mb-1 capitalize">{profile.account_type}</p>
                          <p className="text-gray-400 text-sm">
                            {profile.account_type === 'listener' && 'Discover and enjoy music from creators'}
                            {profile.account_type === 'creator' && 'Share your music and connect with fans'}
                            {profile.account_type === 'brand' && 'Create campaigns and partner with creators'}
                          </p>
                        </div>
                        
                        <RoleSwitcher 
                          currentRole={profile.account_type} 
                          onRoleChange={handleRoleChange} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="integrations">
                <div className="space-y-6">
                  {/* Only show Twitch integration for creators */}
                  {profile.account_type === 'creator' && (
                    <TwitchIntegrationPanel />
                  )}
                  
                  <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                    <CardHeader>
                      <CardTitle>Social Media Integrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-400 py-8">
                        More integrations coming soon
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-gray-400 py-8">
                      Notification preferences coming soon
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
