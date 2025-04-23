
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, TrendingUp } from "lucide-react";

export default function Discover() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8 px-4`}>
          <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Search className="w-6 h-6"/> Discover Music, Users & Trends
            </h1>
            <p className="text-gray-300 mb-6">Explore creators, trending music, hashtags, and promoted campaigns.</p>
            <div className="flex flex-col md:flex-row gap-3 mb-8">
              <Input placeholder="Search by username, post, hashtag, music tag..." />
              <Button className="bg-audifyx-purple">Search</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-2"><Users className="w-4 h-4"/> Creators</h2>
                <p className="text-gray-300">Find and follow top creators.</p>
              </div>
              <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4"/> Trending</h2>
                <p className="text-gray-300">See what’s hot in the community.</p>
              </div>
              <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-2">Promoted</h2>
                <p className="text-gray-300">Featured campaigns and posts.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
