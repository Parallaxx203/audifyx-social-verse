
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BarChart, Upload, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreatorHub() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart className="w-6 h-6"/> Creator Hub
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2"><BarChart className="w-4 h-4"/> Analytics Dashboard</h2>
                <p className="text-gray-300">See music and post stats with visual charts (coming soon).</p>
              </div>
              <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2"><Wallet className="w-4 h-4"/> Withdrawal Request</h2>
                <Button size="sm" className="mt-2 bg-audifyx-purple">Request Payout</Button>
                <p className="text-gray-400 text-sm mt-3">Admin notification of withdrawal requests for manual payment.</p>
              </div>
              <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2"><Upload className="w-4 h-4"/> Upload New Track</h2>
                <Button size="sm" className="mt-2 bg-audifyx-purple">Upload Track</Button>
              </div>
              <div className="bg-audifyx-purple-dark/70 rounded-xl p-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> Brand Campaigns</h2>
                <Button size="sm" className="mt-2 bg-audifyx-purple">Join Campaigns</Button>
                <p className="text-gray-400 text-sm mt-2">List of available campaigns coming soon.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
