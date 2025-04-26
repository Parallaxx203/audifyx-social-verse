
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { UploadTrackModal } from "@/components/creator/UploadTrackModal";
import { PayoutRequestForm } from "@/components/payout/PayoutRequestForm";
import { Calendar, Clock, Music, TrendingUp, Wallet } from "lucide-react";

export default function CreatorHub() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("analytics");
  const [userPoints, setUserPoints] = useState(0);
  const { data: creatorStats, isLoading: statsLoading } = useCreatorStats(user?.id || null);
  const [uploadedTracks, setUploadedTracks] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchUserPoints();
      fetchUserTracks();
      fetchFollowersCount();
    }
  }, [user]);
  
  const fetchUserPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('points')
        .select('points')
        .eq('user_id', user?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      setUserPoints(data?.points || 0);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchUserTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUploadedTracks(data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };
  
  const fetchFollowersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user?.id);
        
      if (error) throw error;
      setFollowersCount(count || 0);
    } catch (error) {
      console.error('Error fetching followers count:', error);
    }
  };
  
  // Weekly data for the dashboard
  const weeklyData = [
    { day: 'Mon', plays: creatorStats?.views_count ? Math.round(creatorStats.views_count / 7) : 0, earnings: (creatorStats?.views_count ? Math.round(creatorStats.views_count / 7) : 0) * 0.02 },
    { day: 'Tue', plays: creatorStats?.views_count ? Math.round(creatorStats.views_count / 6) : 0, earnings: (creatorStats?.views_count ? Math.round(creatorStats.views_count / 6) : 0) * 0.02 },
    { day: 'Wed', plays: creatorStats?.views_count ? Math.round(creatorStats.views_count / 5) : 0, earnings: (creatorStats?.views_count ? Math.round(creatorStats.views_count / 5) : 0) * 0.02 },
    { day: 'Thu', plays: creatorStats?.views_count ? Math.round(creatorStats.views_count / 4) : 0, earnings: (creatorStats?.views_count ? Math.round(creatorStats.views_count / 4) : 0) * 0.02 },
    { day: 'Fri', plays: creatorStats?.views_count ? Math.round(creatorStats.views_count / 3) : 0, earnings: (creatorStats?.views_count ? Math.round(creatorStats.views_count / 3) : 0) * 0.02 },
    { day: 'Sat', plays: creatorStats?.views_count ? Math.round(creatorStats.views_count / 2) : 0, earnings: (creatorStats?.views_count ? Math.round(creatorStats.views_count / 2) : 0) * 0.02 },
    { day: 'Sun', plays: creatorStats?.views_count ? Math.round(creatorStats.views_count / 1) : 0, earnings: (creatorStats?.views_count ? Math.round(creatorStats.views_count / 1) : 0) * 0.02 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-audifyx-blue/90 to-audifyx-purple text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white/90">Creator Hub</h1>
              <UploadTrackModal />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                    <Music className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-400">Tracks</p>
                  <h3 className="text-2xl font-bold">{uploadedTracks.length}</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-400">Plays</p>
                  <h3 className="text-2xl font-bold">{creatorStats?.views_count || 0}</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-400">Points</p>
                  <h3 className="text-2xl font-bold">{userPoints}</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-400">Followers</p>
                  <h3 className="text-2xl font-bold">{followersCount}</h3>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="analytics" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-audifyx-purple-dark/50 border border-audifyx-purple/20">
                <TabsTrigger value="analytics" className="data-[state=active]:bg-audifyx-purple">Analytics</TabsTrigger>
                <TabsTrigger value="tracks" className="data-[state=active]:bg-audifyx-purple">Your Tracks</TabsTrigger>
                <TabsTrigger value="payouts" className="data-[state=active]:bg-audifyx-purple">Request Payout</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics" className="mt-4">
                <Card className="bg-audifyx-purple-dark/70">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Weekly Performance</h2>
                    <div className="h-64 w-full">
                      <div className="h-full flex items-center justify-center">
                        <div className="flex h-full w-full items-end justify-around">
                          {weeklyData.map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <div 
                                className="bg-audifyx-purple w-12 mb-1 rounded-t-md transition-all hover:bg-audifyx-purple-vivid relative group"
                                style={{ height: `${Math.max(20, item.plays)}px` }}
                              >
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-audifyx-charcoal p-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {item.plays} plays<br/>${item.earnings.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-xs mt-1">{item.day}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Card className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Engagement by Type</h4>
                            <TrendingUp className="h-4 w-4 text-audifyx-purple" />
                          </div>
                          <div className="space-y-2 mt-4">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Plays</span>
                                <span>{creatorStats?.views_count || 0}</span>
                              </div>
                              <div className="w-full bg-audifyx-charcoal/50 rounded-full h-2">
                                <div className="bg-audifyx-purple h-2 rounded-full" style={{ 
                                  width: `${Math.min(100, ((creatorStats?.views_count || 0) / (creatorStats?.views_count || 1)) * 100)}%` 
                                }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Likes</span>
                                <span>{creatorStats?.likes_count || 0}</span>
                              </div>
                              <div className="w-full bg-audifyx-charcoal/50 rounded-full h-2">
                                <div className="bg-pink-500 h-2 rounded-full" style={{ 
                                  width: `${Math.min(100, ((creatorStats?.likes_count || 0) / (creatorStats?.views_count || 1)) * 100)}%` 
                                }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Comments</span>
                                <span>{creatorStats?.comments_count || 0}</span>
                              </div>
                              <div className="w-full bg-audifyx-charcoal/50 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ 
                                  width: `${Math.min(100, ((creatorStats?.comments_count || 0) / (creatorStats?.views_count || 1)) * 100)}%` 
                                }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Shares</span>
                                <span>{creatorStats?.shares_count || 0}</span>
                              </div>
                              <div className="w-full bg-audifyx-charcoal/50 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ 
                                  width: `${Math.min(100, ((creatorStats?.shares_count || 0) / (creatorStats?.views_count || 1)) * 100)}%` 
                                }}></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Peak Listening Time</h4>
                            <Clock className="h-4 w-4 text-audifyx-purple" />
                          </div>
                          <div className="flex items-center justify-center h-[130px]">
                            <div className="w-full h-full bg-audifyx-charcoal/30 rounded-lg p-4 flex flex-col justify-center items-center">
                              <div className="text-2xl font-bold text-audifyx-purple-vivid">8:00 PM - 10:00 PM</div>
                              <p className="text-xs text-gray-400">Based on user engagement data</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tracks" className="mt-4">
                <Card className="bg-audifyx-purple-dark/70">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Your Uploaded Tracks</h2>
                      <UploadTrackModal />
                    </div>
                    
                    {uploadedTracks.length > 0 ? (
                      <div className="space-y-4">
                        {uploadedTracks.map((track) => (
                          <Card key={track.id} className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-audifyx-purple/20 rounded-lg flex items-center justify-center overflow-hidden">
                                  {track.cover_url ? (
                                    <img 
                                      src={track.cover_url} 
                                      alt={track.title} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <Music className="w-8 h-8" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">{track.title}</h3>
                                  {track.description && (
                                    <p className="text-sm text-gray-400 line-clamp-1">{track.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-400">
                                      {track.play_count} plays
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(track.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <audio 
                                  controls 
                                  className="max-w-[200px] audio-player"
                                  src={track.track_url}
                                >
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        <Music className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="mb-4">You haven't uploaded any tracks yet</p>
                        <UploadTrackModal />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payouts" className="mt-4">
                <PayoutRequestForm 
                  userPoints={userPoints} 
                  onSuccess={fetchUserPoints} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <style jsx>{`
        .audio-player::-webkit-media-controls-panel {
          background-color: rgba(138, 75, 175, 0.2);
        }
        .audio-player::-webkit-media-controls-play-button {
          background-color: rgba(138, 75, 175, 0.5);
          border-radius: 50%;
        }
        .audio-player::-webkit-media-controls-current-time-display,
        .audio-player::-webkit-media-controls-time-remaining-display {
          color: white;
        }
      `}</style>
    </div>
  );
}
