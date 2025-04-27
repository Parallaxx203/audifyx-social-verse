import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks";
import { Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CreateGroupChatModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', user?.id)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const toggleSelectUser = (userToToggle: any) => {
    const isSelected = selectedUsers.some(u => u.id === userToToggle.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== userToToggle.id));
    } else {
      setSelectedUsers([...selectedUsers, userToToggle]);
    }
  };

  const createGroupChat = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast({
        title: "Invalid Group",
        description: "Please provide a group name and select at least one user",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: chatData, error: chatError } = await supabase.rpc('create_group_chat', {
        p_name: groupName,
        p_creator_id: user?.id,
        p_member_ids: selectedUsers.map(u => u.id)
      });

      if (chatError) throw chatError;

      toast({
        title: "Group Created",
        description: `${groupName} group chat has been created`
      });

      setOpen(false);
      setGroupName("");
      setSearchTerm("");
      setSearchResults([]);
      setSelectedUsers([]);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-audifyx-purple">
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-audifyx-purple-dark/90 border-audifyx-purple/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Create Group Chat
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Group Name</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="bg-audifyx-charcoal/50"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Add Members</label>
            <div className="flex items-center gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for users"
                className="bg-audifyx-charcoal/50"
              />
              <Button 
                type="button" 
                onClick={handleSearch}
                disabled={isLoading || !searchTerm.trim()}
              >
                Search
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="border border-audifyx-purple/20 rounded p-2 max-h-40 overflow-y-auto">
              {searchResults.map(user => (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    selectedUsers.some(u => u.id === user.id) ? 'bg-audifyx-purple/20' : 'hover:bg-audifyx-purple/10'
                  }`}
                  onClick={() => toggleSelectUser(user)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.username}</span>
                  </div>
                  {selectedUsers.some(u => u.id === user.id) && (
                    <div className="w-4 h-4 rounded-full bg-audifyx-purple"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1 block">Selected Users ({selectedUsers.length})</label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="bg-audifyx-purple/20 px-2 py-1 rounded-full flex items-center gap-1 text-sm"
                  >
                    {user.username}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 rounded-full hover:bg-audifyx-purple/20"
                      onClick={() => toggleSelectUser(user)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="ghost"
              onClick={() => setOpen(false)}
              className="border-audifyx-purple/30"
            >
              Cancel
            </Button>
            <Button 
              onClick={createGroupChat}
              disabled={isLoading || !groupName.trim() || selectedUsers.length === 0}
              className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            >
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
