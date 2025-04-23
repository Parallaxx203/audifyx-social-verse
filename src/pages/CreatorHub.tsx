
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { CreatorStatsCard } from "@/components/creator/CreatorStatsCard";
import { CreatorHubStatsPanel } from "@/components/creator/CreatorHubStatsPanel";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/components/ui/use-toast";

export default function CreatorHub() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("audifyx-user");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-audifyx-blue/90 to-audifyx-purple text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-extrabold mb-6 drop-shadow flex items-center gap-2">
              <span className="bg-gradient-to-r from-audifyx-purple to-audifyx-blue text-transparent bg-clip-text">Creator Hub</span>
              <span className="rounded-md px-2 py-1 bg-audifyx-purple/50 text-white text-xs ml-2 tracking-wide animate-pulse">BETA 2.0</span>
            </h1>
            <div className="mb-6">
              <CreatorStatsCard userId={user.id} />
            </div>
            <CreatorHubStatsPanel userId={user.id} />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-audifyx-purple-dark/70 rounded-2xl p-8 flex flex-col gap-3 shadow-md">
                <h2 className="text-xl font-bold mb-2">Request a Payout</h2>
                <Button className="bg-gradient-to-r from-audifyx-blue to-audifyx-purple text-white text-lg shadow-xl">Request Payout</Button>
                <p className="text-gray-400 text-xs mt-2">Payout requests are sent to admins for manual payment. Track your earnings and payments here soon.</p>
              </div>
              <div className="bg-audifyx-blue/60 rounded-2xl p-8 flex flex-col gap-3 shadow-md">
                <h2 className="text-xl font-bold mb-2">Upload New Track</h2>
                <Button className="bg-gradient-to-r from-audifyx-purple to-audifyx-charcoal text-lg text-white font-bold shadow">Upload Track</Button>
                <p className="text-xs text-gray-200 mt-2">Upload new releases, singles or full albums instantly. Enhanced upload experience coming soon!</p>
              </div>
              <div className="bg-gradient-to-tr from-audifyx-green/30 to-audifyx-purple-dark/30 rounded-2xl p-8 flex flex-col gap-3 shadow-lg">
                <h2 className="text-xl font-bold mb-2">Brand Campaigns</h2>
                <Button className="bg-gradient-to-r from-audifyx-green to-audifyx-purple">Join Campaigns</Button>
                <p className="text-green-200 text-xs mt-2">Brand partnerships and influencer campaigns – coming soon for creators.</p>
              </div>
              <div className="bg-gradient-to-tr from-audifyx-charcoal/90 to-audifyx-blue/60 rounded-2xl p-8 flex flex-col gap-3 shadow-lg">
                <h2 className="text-xl font-bold mb-2">Analytics Dashboard</h2>
                <Button variant="outline" className="border-audifyx-purple/30">See More Analytics</Button>
                <p className="text-gray-200 text-xs mt-2">
                  Visualize your performance with advanced analytics, deep insights, and community-driven stats.
                </p>
              </div>
            </div>
            <div className="mt-10 text-center text-gray-400">
              Have a feature request for the Creator/Brand Hub? <Button variant="link">Request Feature</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
