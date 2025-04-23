
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function UserList({ users = [], onUserClick }: { users: any[], onUserClick?: (u: any) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {users.map((user: any) => (
        <div
          key={user.id}
          className={`flex items-center gap-4 bg-audifyx-purple-dark/60 rounded-lg p-4 cursor-pointer transition hover:bg-audifyx-purple-vivid/10 border border-transparent hover:border-audifyx-purple`}
          onClick={() => onUserClick?.(user)}
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
