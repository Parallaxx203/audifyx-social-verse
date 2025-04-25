import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {profile ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Label>Avatar</Label>
              <MediaUploader 
                onUploadComplete={(url) => {
                  console.log("Uploaded file:", url);
                }}
                allowedTypes="both"
                userId={user?.id || ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={profile?.username} disabled />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email} disabled />
          </div>

          <Button onClick={() => navigate('/profile')} className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
            View Profile
          </Button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
