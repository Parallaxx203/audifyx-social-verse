
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadTrackModal } from "@/components/creator/UploadTrackModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { useProfile } from "@/hooks/useProfile";
import { BarChart, LineChart, PieChart, Settings as SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { usePoints } from "@/hooks/usePoints";
import { useNavigate } from "react-router-dom";

export default function CreatorHub() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: stats } = useCreatorStats(user?.id);
  const { totalPoints } = usePoints();
  const [activeTab, setActiveTab] = useState("overview");
  const accountType = user?.user_metadata?.accountType || 'listener';
  const isAllowedToUpload = accountType === 'creator' || accountType === 'brand';

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Creator Hub</h1>
                <p className="text-gray-400">Manage your content, track performance, and grow your audience</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/settings')}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  Profile
                </Button>
                {isAllowedToUpload && (
                  <UploadTrackModal />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.views_count || 0}</div>
                  <p className="text-xs text-gray-400 mt-1">Track your content's reach</p>
                </CardContent>
              </Card>
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Followers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.followers_count || 0}</div>
                  <p className="text-xs text-gray-400 mt-1">Build your audience</p>
                </CardContent>
              </Card>
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalPoints || 0}</div>
                  <p className="text-xs text-gray-400 mt-1">Earn more by engaging with the community</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LineChart className="h-5 w-5" />
                          Weekly Listeners
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] flex items-end justify-between gap-2">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <div key={i} className="relative h-full flex-1 flex flex-col justify-end">
                              <div 
                                className="bg-audifyx-purple rounded-t w-full" 
                                style={{ height: '0%' }}
                              ></div>
                              <span className="text-xs mt-1 text-center">{day}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart className="h-5 w-5" />
                          Top Performing Tracks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center py-6 text-gray-400">Coming Soon</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Audience Demographics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center py-6 text-gray-400">Coming Soon - Data in Development</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                      <CardHeader>
                        <CardTitle>Creator Profile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center">
                          <Avatar className="w-20 h-20 mb-4">
                            <AvatarImage src={profile?.avatar_url || ""} />
                            <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h3 className="text-xl font-bold">{profile?.username}</h3>
                          <p className="text-gray-400 text-sm mb-4">{profile?.bio || "No bio yet"}</p>
                          <div className="w-full grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="font-bold">{stats?.tracks_count || 0}</div>
                              <div className="text-xs text-gray-400">Tracks</div>
                            </div>
                            <div>
                              <div className="font-bold">{stats?.followers_count || 0}</div>
                              <div className="text-xs text-gray-400">Followers</div>
                            </div>
                            <div>
                              <div className="font-bold">{stats?.following_count || 0}</div>
                              <div className="text-xs text-gray-400">Following</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="content" className="mt-6">
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>Your Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-8">Content management coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-6">
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>Detailed Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-8">Advanced analytics coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="earnings" className="mt-6">
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>Earnings & Monetization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-8">Monetization features coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <style>
        {`
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
        `}
      </style>
    </div>
  );
}
