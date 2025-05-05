
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, Trophy, Award, Loader2 } from "lucide-react";

// Function to calculate earnings from points
const calculateEarnings = (points: number) => {
  return (points / 6000) * 3;
};

export default function LeaderboardPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('user_id, username, points')
        .order('points', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLeaderboardData(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Medal className="h-5 w-5 text-amber-700" />;
      default: return <Award className="h-5 w-5 text-audifyx-purple" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? "ml-0" : "ml-64"} p-6`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
              <p className="text-gray-400">Top earners on Audifyx platform</p>
            </div>

            <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Top 20 Users</span>
                  <span>Earnings (1000 points = $0.50)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-audifyx-purple" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboardData.map((user, index) => (
                      <div 
                        key={user.user_id}
                        className={`flex items-center justify-between p-4 rounded-md ${
                          index === 0 
                            ? "bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 border border-yellow-500/30" 
                            : index === 1
                              ? "bg-gradient-to-r from-gray-800/30 to-gray-700/30 border border-gray-400/30"
                              : index === 2
                                ? "bg-gradient-to-r from-amber-900/30 to-amber-800/30 border border-amber-700/30"
                                : "bg-audifyx-purple-dark/30 border border-audifyx-purple/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-audifyx-charcoal">
                            {getRankIcon(index)}
                          </div>
                          <div className="text-lg font-medium w-8 text-center">#{index + 1}</div>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {user.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-sm text-gray-400">{user.points.toFixed(1)} points</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${calculateEarnings(user.points).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}

                    {leaderboardData.length === 0 && (
                      <p className="text-center py-8 text-gray-400">No users have earned points yet.</p>
                    )}
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
