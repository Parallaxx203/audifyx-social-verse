
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateProfile, uploadProfileFile } from "@/hooks/useProfile";

export function EditProfileModal({ open, onOpenChange, profile }: any) {
  const [displayName, setDisplayName] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const updateProfile = useUpdateProfile(profile?.id);

  async function handleSave() {
    setLoading(true);
    let update: any = { username: displayName, bio };

    if (avatarFile) {
      update.avatar_url = await uploadProfileFile("profile_images", avatarFile, profile.id);
    }
    if (bannerFile) {
      update.banner_url = await uploadProfileFile("profile_banners", bannerFile, profile.id);
    }
    update.updated_at = new Date().toISOString();
    await updateProfile.mutateAsync(update);
    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit Profile</DialogTitle>
        <div className="flex flex-col gap-4">
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Username" />
          <Input value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" />
          <div>
            <label className="text-sm mb-1 block">Avatar</label>
            <Input type="file" accept="image/*" onChange={e => setAvatarFile((e.target.files?.[0] || null))} />
          </div>
          <div>
            <label className="text-sm mb-1 block">Banner</label>
            <Input type="file" accept="image/*" onChange={e => setBannerFile((e.target.files?.[0] || null))} />
          </div>
          <Button onClick={handleSave} loading={loading} className="bg-audifyx-purple w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
