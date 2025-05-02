
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Ban, Flag, MessageSquare, Phone } from "lucide-react";
import { useToast } from "@/hooks";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  is_online?: boolean;
  last_seen?: string;
  account_type?: string;
}

interface UserListProps {
  users: User[];
  onUserClick?: (user: User) => void;
}

export function UserList({ users = [], onUserClick }: UserListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { followUser, unfollowUser, isFollowing, followingLoading } = useFollowUser();

  const handleUserClick = (user: User) => {
    if (onUserClick) {
      onUserClick(user);
    } else {
      // Default behavior: navigate to user profile
      navigate(`/profile/${user.username}`);
    }
  };

  const handleFollow = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    try {
      if (!currentUser) {
        toast({ title: "Please log in to follow users" });
        return;
      }

      if (await isFollowing(userId)) {
        await unfollowUser(userId);
        toast({ title: "Unfollowed user" });
      } else {
        await followUser(userId);
        toast({ title: "Now following user" });
      }
    } catch (error) {
      console.error("Follow error:", error);
      toast({ title: "Error", description: "Failed to follow user", variant: "destructive" });
    }
  };

  const handleBlock = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    toast({ 
      title: "User blocked",
      description: `You have blocked ${user.username}`,
    });
    // Implement block functionality here
  };

  const handleReport = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    toast({ 
      title: "Report submitted",
      description: `Thank you for reporting this user. We'll review your report.`,
    });
    // Implement report functionality here
  };

  const handleMessage = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    navigate(`/messages?user=${user.id}`);
  };

  const handleCall = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    navigate(`/call?user=${user.id}`);
  };

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col sm:flex-row sm:items-center gap-4 bg-audifyx-purple-dark/60 rounded-lg p-4 cursor-pointer transition hover:bg-audifyx-purple-vivid/10 border border-transparent hover:border-audifyx-purple"
        >
          <div className="flex items-center gap-4 flex-grow" onClick={() => handleUserClick(user)}>
            <Avatar>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-lg">{user.username}</div>
              <div className={`text-xs mt-1 ${user.is_online ? "text-green-400" : "text-gray-400"}`}>
                {user.is_online ? "Online" : `Last seen: ${user.last_seen ? new Date(user.last_seen).toLocaleString() : "—"}`}
              </div>
              <div className="capitalize text-xs text-audifyx-purple">{user.account_type || ""}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={(e) => handleFollow(e, user.id)}
              disabled={followingLoading}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Follow</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={(e) => handleBlock(e, user)}
            >
              <Ban className="h-4 w-4" />
              <span className="hidden sm:inline">Block</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={(e) => handleReport(e, user)}
            >
              <Flag className="h-4 w-4" />
              <span className="hidden sm:inline">Report</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={(e) => handleMessage(e, user)}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Message</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={(e) => handleCall(e, user)}
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
