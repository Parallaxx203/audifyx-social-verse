
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateProfile, uploadProfileFile, Profile } from "@/hooks/useProfile";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

export function EditProfileModal({ open, onOpenChange, profile }: { open: boolean, onOpenChange: (open: boolean) => void, profile: Profile | null }) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize updateProfile with a safe default
  const updateProfile = useUpdateProfile(user?.id || "");

  // Reset form when profile changes or modal opens
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.username || "");
      setBio(profile.bio || "");
    }
  }, [profile, open]);

  const validateFileType = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG and PNG images are allowed",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  async function handleSave() {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    if (!displayName.trim()) {
      toast({
        title: "Username required",
        description: "Please provide a username",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let update: Partial<Profile> = { 
        username: displayName, 
        bio 
      };

      if (avatarFile) {
        if (!validateFileType(avatarFile)) {
          setIsLoading(false);
          return;
        }
        update.avatar_url = await uploadProfileFile("profile_images", avatarFile, user.id);
      }
      
      if (bannerFile) {
        if (!validateFileType(bannerFile)) {
          setIsLoading(false);
          return;
        }
        update.banner_url = await uploadProfileFile("profile_banners", bannerFile, user.id);
      }
      
      update.updated_at = new Date().toISOString();
      await updateProfile.mutateAsync(update);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-audifyx-purple-dark/90 border-audifyx-purple/30">
        <DialogTitle>Edit Profile</DialogTitle>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username"
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)} 
              placeholder="Username" 
              className="bg-audifyx-charcoal/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio"
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              placeholder="Tell us about yourself"
              className="bg-audifyx-charcoal/50"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture (JPEG/PNG only)</Label>
            <Input 
              id="avatar"
              type="file" 
              accept="image/jpeg, image/png" 
              onChange={e => setAvatarFile(e.target.files?.[0] || null)} 
              className="bg-audifyx-charcoal/50"
            />
            {profile?.avatar_url && (
              <div className="mt-2 flex items-center gap-2">
                <img src={profile.avatar_url} alt="Current avatar" className="w-10 h-10 rounded-full object-cover" />
                <span className="text-sm text-gray-400">Current profile picture</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="banner">Banner Image (JPEG/PNG only)</Label>
            <Input 
              id="banner"
              type="file" 
              accept="image/jpeg, image/png" 
              onChange={e => setBannerFile(e.target.files?.[0] || null)} 
              className="bg-audifyx-charcoal/50"
            />
            {profile?.banner_url && (
              <div className="mt-2">
                <img src={profile.banner_url} alt="Current banner" className="w-full h-20 object-cover rounded" />
                <span className="text-sm text-gray-400">Current banner image</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid w-full mt-2"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
