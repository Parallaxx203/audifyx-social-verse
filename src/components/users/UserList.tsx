
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, MoreHorizontal, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFollowUser } from '@/hooks/useFollowUser';
import { useToast } from '@/hooks/use-toast';

interface UserListProps {
  users: {
    id: string;
    username: string;
    avatar_url?: string | null;
    is_online?: boolean;
    last_seen?: string;
    role?: string;
    bio?: string;
  }[];
}

export function UserList({ users }: UserListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const viewProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const sendMessage = (username: string) => {
    navigate(`/messages?user=${username}`);
  };

  const UserCard = ({ user }: { user: UserListProps['users'][0] }) => {
    const { isFollowing, followUser, unfollowUser, isLoading } = useFollowUser(user.id);

    const handleFollowToggle = async () => {
      try {
        if (isFollowing) {
          await unfollowUser();
          toast({ description: `You unfollowed ${user.username}` });
        } else {
          await followUser();
          toast({ description: `You are now following ${user.username}` });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update follow status',
          variant: 'destructive'
        });
      }
    };

    const blockUser = () => {
      toast({
        description: `User ${user.username} has been blocked`,
      });
    };

    return (
      <Card className="p-4 bg-audifyx-purple-dark/30 border-audifyx-purple/20 hover:bg-audifyx-purple-dark/40 transition-colors">
        <div className="flex gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 cursor-pointer" onClick={() => viewProfile(user.username)}>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {user.is_online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-1 ring-white"></span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <div>
                <h3 
                  className="font-medium hover:underline cursor-pointer" 
                  onClick={() => viewProfile(user.username)}
                >
                  {user.username}
                </h3>
                <div className="flex items-center gap-2">
                  {user.role && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1 py-0 h-5 capitalize"
                    >
                      {user.role}
                    </Badge>
                  )}
                  {user.last_seen && !user.is_online && (
                    <p className="text-xs text-gray-400">
                      Last seen {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                    </p>
                  )}
                  {user.is_online && (
                    <p className="text-xs text-green-400">Online now</p>
                  )}
                </div>
              </div>
            </div>
            
            {user.bio && (
              <p className="text-sm text-gray-400 mt-1 truncate">{user.bio}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            className={isFollowing ? "bg-audifyx-purple/40" : "bg-audifyx-purple hover:bg-audifyx-purple-vivid"}
            onClick={handleFollowToggle}
            disabled={isLoading}
          >
            <User className="h-3 w-3 mr-1" />
            {isFollowing ? "Following" : "Follow"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => sendMessage(user.username)}>
            <MessageSquare className="h-3 w-3 mr-1" />
            Message
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => viewProfile(user.username)}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={blockUser} className="text-red-500">
                <UserX className="h-3 w-3 mr-1" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
      
      {users.length === 0 && (
        <div className="col-span-full flex justify-center py-12">
          <div className="text-center text-gray-400">
            <p>No users found</p>
          </div>
        </div>
      )}
    </div>
  );
}
