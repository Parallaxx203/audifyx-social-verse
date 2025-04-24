import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MediaUploader } from "@/components/ui/media-uploader";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [twitchUsername, setTwitchUsername] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState(["", "", ""]);
  const [avatar, setAvatar] = useState("");

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio,
          links,
          avatar_url: avatar,
          twitch_username: twitchUsername
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast({ title: "Profile updated successfully!" });
    } catch (error) {
      toast({ title: "Error updating profile", variant: "destructive" });
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user?.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Error uploading avatar", variant: "destructive" });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    setAvatar(publicUrl);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-audifyx">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <span>Notifications</span>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label>Profile Photo</label>
              <MediaUploader onUpload={handleAvatarUpload} />
            </div>
            <div>
              <label>Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label>Twitch Username</label>
              <Input value={twitchUsername} onChange={(e) => setTwitchUsername(e.target.value)} />
            </div>
            <div>
              <label>Links (Max 3)</label>
              {links.map((link, i) => (
                <Input
                  key={i}
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[i] = e.target.value;
                    setLinks(newLinks);
                  }}
                  placeholder={`Link ${i + 1}`}
                  className="mb-2"
                />
              ))}
            </div>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}