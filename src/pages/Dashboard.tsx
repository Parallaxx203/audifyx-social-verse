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
  const [activeTab, setActiveTab] = useState("overview");

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
          <Card className="mb-8 border-audifyx-purple/20 bg-gradient-to-br from-audifyx-purple/20 to-audifyx-blue/20 backdrop-blur-sm overflow-hidden animate-fade-in">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome, {user?.user_metadata?.username || 'Guest'}!
                </h2>
                <p className="text-gray-300">
                  {accountType === 'listener' && 'Discover and enjoy music from your favorite creators.'}
                  {accountType === 'creator' && 'Share your music and connect with your audience.'}
                  {accountType === 'brand' && 'Create campaigns and connect with talented creators.'}
                </p>
              </div>
              <div className="flex gap-4">
                {accountType === 'creator' && (
                  <>
                    <UploadTrackModal />
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-audifyx-purple/30 hover:bg-audifyx-purple/20 transition-colors"
                      onClick={() => navigate('/my-tracks')}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      View All Tracks
                    </Button>
                  </>
                )}
                {accountType === 'listener' && (
                  <Button 
                    size="lg" 
                    className="bg-audifyx-purple hover:bg-audifyx-purple-vivid transition-colors"
                    onClick={() => navigate('/discover')}
                  >
                    Explore Tracks
                  </Button>
                )}
                {accountType === 'brand' && (
                  <Button 
                    size="lg" 
                    className="bg-audifyx-purple hover:bg-audifyx-purple-vivid transition-colors"
                    onClick={() => navigate('/brand-hub')}
                  >
                    Create Campaign
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-audifyx-purple/30 hover:bg-audifyx-purple/20 transition-colors"
                  onClick={() => navigate(accountType === 'creator' ? '/creator-hub' : accountType === 'brand' ? '/brand-hub' : '/profile')}
                >
                  {accountType === 'listener' && 'View Profile'}
                  {accountType === 'creator' && 'Creator Hub'}
                  {accountType === 'brand' && 'Brand Hub'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs 
                defaultValue="overview" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="bg-audifyx-charcoal/50 border border-audifyx-purple/20">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-audifyx-purple">Overview</TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-audifyx-purple">Activity</TabsTrigger>
                  {accountType === 'creator' && (
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-audifyx-purple">Analytics</TabsTrigger>
                  )}
                  {accountType === 'brand' && (
                    <TabsTrigger value="campaigns" className="data-[state=active]:bg-audifyx-purple">Campaigns</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-audifyx-purple/20 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                          <Users className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-gray-400">Followers</p>
                        <h3 className="text-2xl font-bold">{userStats.followers}</h3>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-audifyx-purple/20 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                          <Music className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-gray-400">Tracks</p>
                        <h3 className="text-2xl font-bold">{userStats.tracks}</h3>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-audifyx-purple/20 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-gray-400">Points</p>
                        <h3 className="text-2xl font-bold">{userStats.points}</h3>
                      </CardContent>
                    </Card>
                    
                    {(accountType === 'creator' || accountType === 'brand') && (
                      <Card className="bg-audifyx-purple/20 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                        <CardContent className="p-4 flex flex-col items-center">
                          <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                          <p className="text-sm text-gray-400">Earnings</p>
                          <h3 className="text-2xl font-bold">${userStats.earnings}</h3>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {accountType === 'listener' ? 'Recently Played' : 
                         accountType === 'creator' ? 'Your Tracks' : 'Your Campaigns'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {campaigns.length > 0 ? (
                          campaigns.slice(0, 3).map((campaign: any, i: number) => (
                            <Card key={i} className="bg-audifyx-charcoal/50 hover:bg-audifyx-charcoal/70 transition-all cursor-pointer">
                              <div className="aspect-square bg-gradient-to-br from-audifyx-blue/20 to-audifyx-purple/20 flex items-center justify-center text-4xl">
                                🎵
                              </div>
                              <CardContent className="p-4">
                                <h4 className="font-medium truncate">{campaign.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">${campaign.budget} budget</p>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Card className="col-span-full bg-audifyx-charcoal/30 p-6 flex flex-col items-center justify-center">
                            <p className="text-gray-400 text-center mb-4">
                              {accountType === 'creator' 
                                ? 'Upload your first track to get started!' 
                                : accountType === 'brand'
                                  ? 'Create your first campaign to connect with creators!'
                                  : 'Follow creators to discover new music!'}
                            </p>
                            {accountType === 'creator' ? (
                              <UploadTrackModal />
                            ) : (
                              <Button 
                                className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                                onClick={() => navigate(accountType === 'brand' ? '/brand-hub' : '/discover')}
                              >
                                {accountType === 'brand' ? 'Create Campaign' : 'Discover Creators'}
                              </Button>
                            )}
                          </Card>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto" 
                        onClick={() => navigate(
                          accountType === 'creator' ? '/my-tracks' : 
                          accountType === 'brand' ? '/brand-hub' : 
                          '/discover'
                        )}
                      >
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
                    <CardHeader>
                      <CardTitle className="text-xl">Social Feed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SocialFeed />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="animate-fade-in">
                  <ActivityChart data={activityData} />
                </TabsContent>

                {accountType === 'creator' && (
                  <TabsContent value="analytics" className="animate-fade-in">
                    <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
                      <CardHeader>
                        <CardTitle className="text-xl">Performance Analytics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EngagementChart data={engagementData} />
                          <AudienceChart data={audienceData} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {accountType === 'brand' && (
                  <TabsContent value="campaigns" className="animate-fade-in">
                    <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl">Your Campaigns</CardTitle>
                        <Button 
                          onClick={() => navigate('/brand-hub')}
                          className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                        >
                          Create Campaign
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {campaigns.length > 0 ? (
                          <div className="space-y-4">
                            {campaigns.map((campaign: any, i: number) => (
                              <Card key={i} className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
                                <CardContent className="p-4 flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium">{campaign.title}</h4>
                                    <p className="text-xs text-gray-400 mt-1">Budget: ${campaign.budget}</p>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 
                                      ${campaign.status === 'active' ? 'bg-green-500' : 
                                        campaign.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    />
                                    <span className="text-sm capitalize">{campaign.status}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <BarChart2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold">No campaigns yet</h3>
                            <p className="text-gray-400 mt-2 mb-4">Create your first campaign to start connecting with creators.</p>
                            <Button 
                              onClick={() => navigate('/brand-hub')}
                              className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                            >
                              Create First Campaign
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="bg-audifyx-purple/20 border-audifyx-purple/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-0">
                  <MiniPhone accountType={accountType} />
                </CardContent>
              </Card>

              <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
                <CardHeader>
                  <CardTitle className="text-xl">Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 hover-scale">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-audifyx-purple to-audifyx-blue p-[2px]">
                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                            <span className="text-2xl">🎵</span>
                          </div>
                        </div>
                        <p className="text-xs text-center mt-1 truncate w-20">User {i + 1}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                    <div className="flex items-center gap-3 p-2 hover:bg-audifyx-purple/10 rounded-md transition-colors cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>U3</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm"><span className="font-medium">User3</span> commented on your post</p>
                        <p className="text-xs text-gray-400">1d ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full text-audifyx-purple">
                    View All Notifications
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
