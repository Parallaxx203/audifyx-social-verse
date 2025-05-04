import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { SocialFeed } from "@/components/dashboard/social-feed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MiniPhone } from "@/components/dashboard/mini-phone";
import { ActivityChart, EngagementChart, AudienceChart } from "@/components/dashboard/DashboardCharts";
import { 
  BarChart2, Music, Bell, Calendar, ChevronRight, Heart, 
  MessageSquare, Share2, TrendingUp, Users, Wallet, Upload 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UploadTrackModal } from "@/components/creator/UploadTrackModal";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

export default function Dashboard() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    points: 0,
    followers: 0,
    tracks: 0,
    earnings: 0,
  });
  const [campaigns, setCampaigns] = useState([]);

  const accountType = user?.user_metadata?.accountType || "listener";

  useEffect(() => {
    if (user) {
      fetchUserStats();
      if (accountType === 'creator' || accountType === 'brand') {
        fetchCampaigns();
      }
    }
    setLoading(false);
  }, [user, accountType]);

  const fetchUserStats = async () => {
    try {
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('points')
        .eq('user_id', user?.id)
        .single();

      if (pointsError) throw pointsError;

      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user?.id);

      if (followersError) throw followersError;

      const { count: tracksCount, error: tracksError } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (tracksError) throw tracksError;

      setUserStats({
        points: pointsData?.points || 0,
        followers: followersCount || 0,
        tracks: tracksCount || 0,
        earnings: Number(((pointsData?.points || 0) / 100).toFixed(2)),
      });

    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast({
        title: "Error",
        description: "Failed to load user statistics",
        variant: "destructive"
      });
    }
  };

  const fetchCampaigns = async () => {
    try {
      let query;
      
      if (accountType === 'brand') {
        query = supabase
          .from('campaigns')
          .select('*')
          .eq('brand_id', user?.id);
      } else {
        query = supabase
          .from('campaigns')
          .select('*')
          .eq('status', 'active');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setCampaigns(data || []);
      
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const activityData = [
    { name: 'Mon', value: 20 },
    { name: 'Tue', value: 40 },
    { name: 'Wed', value: 30 },
    { name: 'Thu', value: 70 },
    { name: 'Fri', value: 50 },
    { name: 'Sat', value: 90 },
    { name: 'Sun', value: 60 }
  ];

  const engagementData = [
    { date: '1/1', likes: 40, shares: 24 },
    { date: '2/1', likes: 30, shares: 13 },
    { date: '3/1', likes: 20, shares: 98 },
    { date: '4/1', likes: 27, shares: 39 },
    { date: '5/1', likes: 18, shares: 48 },
    { date: '6/1', likes: 23, shares: 38 },
    { date: '7/1', likes: 34, shares: 43 }
  ];

  const audienceData = [
    { date: '1/1', followers: 400 },
    { date: '2/1', followers: 430 },
    { date: '3/1', followers: 448 },
    { date: '4/1', followers: 470 },
    { date: '5/1', followers: 540 },
    { date: '6/1', followers: 580 },
    { date: '7/1', followers: 690 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-audifyx flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />

        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4 md:p-8`}>
          {/* Dashboard Welcome Component with Stories */}
          <DashboardWelcome />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-3">
              {/* Social feed */}
              <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
                <CardHeader>
                  <CardTitle className="text-xl">Social Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <SocialFeed />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 lg:hidden">
              {/* Notifications for mobile */}
              <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">Notifications</CardTitle>
                  <Bell className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-2 hover:bg-audifyx-purple/10 rounded-md transition-colors cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>U1</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm"><span className="font-medium">User1</span> liked your track</p>
                        <p className="text-xs text-gray-400">2h ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-audifyx-purple/10 rounded-md transition-colors cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>U2</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm"><span className="font-medium">User2</span> followed you</p>
                        <p className="text-xs text-gray-400">5h ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
