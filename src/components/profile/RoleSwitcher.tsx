
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserRound, Music, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";

type AccountType = 'listener' | 'creator' | 'brand';

interface RoleSwitcherProps {
  currentRole: AccountType;
  onRoleChange: (role: AccountType) => void;
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AccountType>(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { accountType: selectedRole }
      });

      if (metadataError) throw metadataError;

      // Update profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ account_type: selectedRole })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update local storage
      const userInfo = localStorage.getItem('audifyx-user');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        userData.accountType = selectedRole;
        localStorage.setItem('audifyx-user', JSON.stringify(userData));
      }

      onRoleChange(selectedRole);
      toast({
        title: "Account mode changed",
        description: `You are now using Audifyx as a ${selectedRole}.`
      });

      // Close the dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Error changing role:", error);
      toast({
        title: "Error",
        description: "Failed to change account mode. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="border-audifyx-purple/30 text-white hover:bg-audifyx-purple/20"
      >
        Switch Role
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Switch Account Mode</DialogTitle>
            <DialogDescription>
              Change how you use Audifyx based on your current needs.
            </DialogDescription>
          </DialogHeader>

          <RadioGroup 
            value={selectedRole} 
            onValueChange={(value) => setSelectedRole(value as AccountType)}
            className="space-y-4 py-4"
          >
            <div className={`flex items-center space-x-4 rounded-md border p-4 ${selectedRole === 'listener' ? 'border-audifyx-purple bg-audifyx-purple/10' : 'border-gray-700'}`}>
              <RadioGroupItem value="listener" id="listener" />
              <Label htmlFor="listener" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="rounded-full bg-audifyx-purple/20 p-2">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Listener</div>
                  <div className="text-sm text-gray-400">Discover and enjoy music from creators</div>
                </div>
              </Label>
            </div>
            
            <div className={`flex items-center space-x-4 rounded-md border p-4 ${selectedRole === 'creator' ? 'border-audifyx-purple bg-audifyx-purple/10' : 'border-gray-700'}`}>
              <RadioGroupItem value="creator" id="creator" />
              <Label htmlFor="creator" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="rounded-full bg-audifyx-purple/20 p-2">
                  <Music className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Creator</div>
                  <div className="text-sm text-gray-400">Share your music and connect with fans</div>
                </div>
              </Label>
            </div>
            
            <div className={`flex items-center space-x-4 rounded-md border p-4 ${selectedRole === 'brand' ? 'border-audifyx-purple bg-audifyx-purple/10' : 'border-gray-700'}`}>
              <RadioGroupItem value="brand" id="brand" />
              <Label htmlFor="brand" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="rounded-full bg-audifyx-purple/20 p-2">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Brand</div>
                  <div className="text-sm text-gray-400">Create campaigns and partner with creators</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRoleChange} 
              disabled={isLoading || selectedRole === currentRole}
              className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            >
              {isLoading ? "Switching..." : "Switch Mode"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
