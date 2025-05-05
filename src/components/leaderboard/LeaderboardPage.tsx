
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePointsSystem } from "@/hooks/usePointsSystem";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string | null;
  points: number;
  position: number;
}

export default function LeaderboardPage() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { points } = usePointsSystem();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Just set loading to false for now - coming soon feature
    setIsLoading(false);
  }, []);

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
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-16">
                  <div className="text-center space-y-3">
                    <div className="inline-flex rounded-full bg-audifyx-purple/20 p-8 mb-2">
                      <Trophy className="h-12 w-12 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                    <p className="text-gray-400 max-w-md">
                      Our global leaderboard is currently in development. Check back soon to see how you rank against other creators and fans on the platform!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-purple-400" />
                  Your Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Skeleton className="h-16 w-60 rounded-xl" />
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center mb-3">
                        <Avatar className="h-16 w-16 border-2 border-audifyx-purple/50">
                          <AvatarImage src={user?.user_metadata?.avatar_url} />
                          <AvatarFallback>
                            {user?.user_metadata?.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="text-4xl font-bold mb-1">{points}</div>
                      <div className="text-gray-400 text-sm">Current Points</div>
                      
                      <div className="mt-4 bg-audifyx-purple/20 px-6 py-3 rounded-full">
                        <div className="flex items-center gap-2">
                          <Medal className="h-4 w-4 text-purple-400" />
                          <span className="text-sm font-medium">Feature coming soon!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
