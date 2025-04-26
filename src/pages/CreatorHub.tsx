
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, Clock, Music, TrendingUp, Wallet, X } from "lucide-react";

export default function CreatorHub() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [points, setPoints] = useState("");
  const [amount, setAmount] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("request");
  const [creatorStats, setCreatorStats] = useState({
    tracks: 0,
    plays: 0,
    earnings: 0,
    followers: 0
  });

  useEffect(() => {
    if (user) {
      fetchPaymentRequests();
      fetchCreatorStats();
    }
  }, [user]);

  const fetchPaymentRequests = async () => {
    try {
      // Using withdrawals table instead of payment_requests
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .eq('user_id', user?.id)
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      setPaymentRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast({
        title: "Error",
        description: "Failed to load payment requests",
        variant: "destructive"
      });
    }
  };

  const fetchCreatorStats = async () => {
    try {
      // Fetch creator stats
      const { data: statsData, error: statsError } = await supabase
        .from('creator_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') throw statsError;
      
      // Fetch points
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('points')
        .eq('user_id', user?.id)
        .single();
        
      if (pointsError && pointsError.code !== 'PGRST116') throw pointsError;
      
      // Fetch tracks count
      const { count: tracksCount, error: tracksError } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
        
      if (tracksError) throw tracksError;
      
      // Fetch followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user?.id);
        
      if (followersError) throw followersError;
      
      setCreatorStats({
        tracks: tracksCount || 0,
        plays: statsData?.views_count || 0,
        earnings: ((pointsData?.points || 0) / 100), // Assuming 100 points = $1
        followers: followersCount || 0
      });
    } catch (error) {
      console.error('Error fetching creator stats:', error);
      toast({
        title: "Error",
        description: "Failed to load creator statistics",
        variant: "destructive"
      });
    }
  };

  const handlePaymentRequest = async () => {
    if (!points || !amount || !screenshotUrl) {
      toast({ 
        title: "Validation Error",
        description: "Please fill all fields and upload screenshot"
      });
      return;
    }

    const pointsNum = parseInt(points);
    const amountNum = parseFloat(amount);

    if (isNaN(pointsNum) || isNaN(amountNum) || pointsNum <= 0 || amountNum <= 0) {
      toast({ 
        title: "Invalid Input",
        description: "Please enter valid numbers for points and amount"
      });
      return;
    }

    try {
      // Use withdrawals table instead of payment_requests
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user?.id,
          amount: parseFloat(amount),
          status: 'pending',
          // Store screenshot URL in verification_image field
          verification_image: screenshotUrl
        });

      if (error) throw error;

      await fetch('/api/send-payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'loops4aiden@gmail.com',
          points,
          amount,
          screenshotUrl,
          userId: user?.id
        })
      });

      toast({ title: "Payment request submitted successfully!" });
      setPoints("");
      setAmount("");
      setScreenshotUrl("");
      fetchPaymentRequests();
    } catch (error) {
      toast({ title: "Error submitting payment request", variant: "destructive" });
    }
  };

  const handleScreenshotUpload = (url: string) => {
    setScreenshotUrl(url);
  };
  
  // Weekly data for the dashboard
  const weeklyData = [
    { day: 'Mon', plays: 120, earnings: 2.4 },
    { day: 'Tue', plays: 145, earnings: 2.9 },
    { day: 'Wed', plays: 132, earnings: 2.6 },
    { day: 'Thu', plays: 160, earnings: 3.2 },
    { day: 'Fri', plays: 180, earnings: 3.6 },
    { day: 'Sat', plays: 190, earnings: 3.8 },
    { day: 'Sun', plays: 170, earnings: 3.4 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-audifyx-blue/90 to-audifyx-purple text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-white/90">Creator Hub</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                    <Music className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-400">Tracks</p>
                  <h3 className="text-2xl font-bold">{creatorStats.tracks}</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-400">Plays</p>
                  <h3 className="text-2xl font-bold">{creatorStats.plays}</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-400">Earnings</p>
                  <h3 className="text-2xl font-bold">${creatorStats.earnings.toFixed(2)}</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/20 hover:bg-audifyx-purple/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-audifyx-purple/20 p-2 mb-2">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-400">Followers</p>
                  <h3 className="text-2xl font-bold">{creatorStats.followers}</h3>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="request" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-audifyx-purple-dark/50 border border-audifyx-purple/20">
                <TabsTrigger value="request" className="data-[state=active]:bg-audifyx-purple">Request Payment</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-audifyx-purple">Payment History</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-audifyx-purple">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="request" className="mt-4">
                <Card className="bg-audifyx-purple-dark/70 p-6">
                  <CardHeader>
                    <CardTitle>Request Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="number"
                      placeholder="Points Earned"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Amount in USD"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="space-y-2">
                      <label className="text-sm">Upload Earnings Screenshot</label>
                      <MediaUploader
                        onUploadComplete={handleScreenshotUpload}
                        allowedTypes="both"
                        userId={user?.id || ""}
                      />
                    </div>
                    <Button
                      onClick={handlePaymentRequest}
                      className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                    >
                      Submit Payment Request
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <Card className="bg-audifyx-purple-dark/70">
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentRequests.length > 0 ? (
                      <div className="space-y-4">
                        {paymentRequests.map((request: any, index: number) => (
                          <Card key={index} className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">${request.amount}</h4>
                                  <p className="text-xs text-gray-400">
                                    Requested on {new Date(request.requested_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge
                                  className={
                                    request.status === 'approved' ? 'bg-green-600' : 
                                    request.status === 'rejected' ? 'bg-red-600' : 
                                    'bg-yellow-600'
                                  }
                                >
                                  {request.status === 'approved' ? <Check className="h-3 w-3 mr-1" /> : 
                                   request.status === 'rejected' ? <X className="h-3 w-3 mr-1" /> : 
                                   <Clock className="h-3 w-3 mr-1" />}
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        <Wallet className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p>No payment requests yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-4">
                <Card className="bg-audifyx-purple-dark/70">
                  <CardHeader>
                    <CardTitle>Weekly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      {/* This is a placeholder for the chart - replace with an actual chart component */}
                      <div className="h-full flex items-center justify-center">
                        <div className="flex h-full w-full items-end justify-around">
                          {weeklyData.map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <div 
                                className="bg-audifyx-purple w-10 mb-1" 
                                style={{ height: `${item.plays/2}px` }}
                              ></div>
                              <div className="text-xs">{item.day}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Card className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Most Popular Track</h4>
                            <Music className="h-4 w-4" />
                          </div>
                          <p className="text-lg font-bold">Track Title</p>
                          <p className="text-xs text-gray-400">2,345 plays</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Peak Listening Time</h4>
                            <Clock className="h-4 w-4" />
                          </div>
                          <p className="text-lg font-bold">8:00 PM - 10:00 PM</p>
                          <p className="text-xs text-gray-400">Weekdays</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
