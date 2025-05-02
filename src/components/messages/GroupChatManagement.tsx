
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { X, UserPlus, Settings, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks";
import { GroupChat } from "@/types/chat";

interface GroupChatManagementProps {
  groupId: string;
  isCreator: boolean;
  onUpdate: () => void;
}

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

export function GroupChatManagement({ groupId, isCreator, onUpdate }: GroupChatManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchGroupData();
      fetchAllUsers();
    }
  }, [isOpen, groupId]);

  const fetchGroupData = async () => {
    try {
      // Get group details
      const { data: groupData, error: groupError } = await supabase
        .from('group_chats')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      setGroupName(groupData.name);

      // Get group members
      const { data: memberData, error: memberError } = await supabase
        .from('group_chat_members')
        .select(`
          user_id,
          profiles:user_id (
            id, username, avatar_url
          )
        `)
        .eq('group_id', groupId);

      if (memberError) throw memberError;

      const transformedMembers = memberData.map((item: any) => item.profiles);
      setMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching group data:', error);
      toast({
        title: "Error",
        description: "Failed to load group information",
        variant: "destructive"
      });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url');

      if (error) throw error;

      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/group-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          action: 'add_members',
          groupId,
          newMembers: selectedUsers
        })
      });

      if (!response.ok) throw new Error('Failed to add members');

      toast({
        title: "Success",
        description: "Members added to the group"
      });

      setSelectedUsers([]);
      fetchGroupData();
      onUpdate();
    } catch (error) {
      console.error('Error adding members:', error);
      toast({
        title: "Error",
        description: "Failed to add members",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/group-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          action: 'remove_member',
          groupId,
          memberIds: [memberId]
        })
      });

      if (!response.ok) throw new Error('Failed to remove member');

      toast({
        title: "Success",
        description: "Member removed from the group"
      });

      // Update local state
      setMembers(members.filter(member => member.id !== memberId));
      onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!groupName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('group_chats')
        .update({ name: groupName })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group name updated"
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating group name:', error);
      toast({
        title: "Error",
        description: "Failed to update group name",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Filter out users who are already members
  const filteredUsers = allUsers.filter(user => 
    !members.some(member => member.id === user.id)
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 rounded-full"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Group Chat Management</DialogTitle>
            <DialogDescription>
              {isCreator 
                ? "As the group creator, you can manage members and settings." 
                : "View group members and information."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex space-x-4 border-b">
            <button 
              className={`pb-2 pt-1 px-1 ${activeTab === 'members' ? 'border-b-2 border-audifyx-purple font-semibold' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Members
            </button>
            {isCreator && (
              <button 
                className={`pb-2 pt-1 px-1 ${activeTab === 'settings' ? 'border-b-2 border-audifyx-purple font-semibold' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            )}
          </div>

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Current Members ({members.length})</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-audifyx-charcoal/30 rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || ""} />
                          <AvatarFallback>{member.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{member.username}</span>
                      </div>
                      {isCreator && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isCreator && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Add New Members</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 hover:bg-audifyx-purple/10 rounded-md">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{user.username}</span>
                        </div>
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)} 
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleAddMembers}
                    disabled={selectedUsers.length === 0 || isSaving}
                    className="w-full mt-4 bg-audifyx-purple hover:bg-audifyx-purple-vivid gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Selected Members
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && isCreator && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="group-name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUpdateGroupName}
                    disabled={!groupName.trim() || isSaving}
                  >
                    Save
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Group Photo</Label>
                <div className="flex items-center justify-center h-32 bg-audifyx-charcoal/30 rounded-md mt-2">
                  <Button variant="outline" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Upload a square image, minimum 300x300px (Coming soon)
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
