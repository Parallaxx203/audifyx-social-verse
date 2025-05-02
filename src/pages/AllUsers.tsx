
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { User } from "lucide-react";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { UserList } from "@/components/users/UserList";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AllUsers() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useOnlineUsers(search);

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8 px-4`}>
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <User className="w-6 h-6"/> All Users
            </h1>

            <Card className="p-4 bg-audifyx-purple-dark/40 mb-6">
              <div className="mb-3">
                <Input
                  placeholder="Search users by username"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-audifyx-purple-dark/50 border-audifyx-purple/30"
                />
              </div>
              
              <div className="text-sm text-gray-400">
                Use the buttons below each user to connect, message, or manage your interactions
              </div>
            </Card>

            <div className="bg-audifyx-purple-dark/70 rounded-xl p-4 md:p-8">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-audifyx-purple">Loading users...</div>
                </div>
              ) : users && users.length > 0 ? (
                <UserList users={users} />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {search ? `No users found matching "${search}"` : "No users found"}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
