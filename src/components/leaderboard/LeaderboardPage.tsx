
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export default function LeaderboardPage() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
            <p className="text-gray-300 mb-6">Track top creators and fans.</p>
            
            <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                    <p className="text-gray-400">
                      Our global leaderboard is under development. Check back soon for real-time rankings!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold mb-1">0</div>
                    <div className="text-gray-400 text-sm">Current Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
