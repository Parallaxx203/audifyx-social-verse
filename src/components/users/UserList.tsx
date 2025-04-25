
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

  const handleUserClick = (user: User) => {
    if (onUserClick) {
      onUserClick(user);
    } else {
      // Default behavior: navigate to user profile
      navigate(`/profile/${user.username}`);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-4 bg-audifyx-purple-dark/60 rounded-lg p-4 cursor-pointer transition hover:bg-audifyx-purple-vivid/10 border border-transparent hover:border-audifyx-purple"
          onClick={() => handleUserClick(user)}
        >
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
      ))}
    </div>
  );
}
