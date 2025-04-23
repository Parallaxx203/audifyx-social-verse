
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, TrendingUp } from "lucide-react";
import { DiscoverFeed } from "@/components/discover/DiscoverFeed";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { UserList } from "@/components/users/UserList";

export default function Discover() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"feed" | "users">("feed");
  const { data: users, isLoading: loadingUsers } = useOnlineUsers(search);

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8 px-4`}>
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Search className="w-6 h-6"/> Discover Music, Users & Trends
            </h1>
            <p className="text-gray-300 mb-6">Explore creators, trending music, hashtags, and promoted campaigns.</p>
            
            <div className="flex gap-3 mb-5">
              <Button
                variant={tab === "feed" ? "default" : "outline"}
                onClick={() => setTab("feed")}
                className={tab === "feed" ? "bg-audifyx-purple" : ""}
              >Feed</Button>
              <Button
                variant={tab === "users" ? "default" : "outline"}
                onClick={() => setTab("users")}
                className={tab === "users" ? "bg-audifyx-purple" : ""}
              >Users</Button>
            </div>

            {tab === "feed" ? (
              <DiscoverFeed />
            ) : (
              <div>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Search users by username"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                {loadingUsers ? (
                  <div>Loading users...</div>
                ) : (
                  <UserList users={users || []} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
