
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { User } from "lucide-react";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { UserList } from "@/components/users/UserList";
import { Input } from "@/components/ui/input";

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

            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Search users by username"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="bg-audifyx-purple-dark/70 rounded-xl p-8">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <UserList users={users || []} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
