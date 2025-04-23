
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "@/components/ui/use-toast";

export default function BrandHub() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("audifyx-user");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // Mock data for brand campaigns and metrics
  const campaignData = [
    { day: "Mon", impressions: 400, engagements: 240 },
    { day: "Tue", impressions: 300, engagements: 139 },
    { day: "Wed", impressions: 200, engagements: 980 },
    { day: "Thu", impressions: 278, engagements: 390 },
    { day: "Fri", impressions: 189, engagements: 480 },
    { day: "Sat", impressions: 239, engagements: 380 },
    { day: "Sun", impressions: 349, engagements: 430 },
  ];

  const handleFeatureClick = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development and will be available soon.",
    });
  };

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
              <span className="bg-gradient-to-r from-audifyx-purple to-audifyx-blue text-transparent bg-clip-text">Brand Hub</span>
              <span className="rounded-md px-2 py-1 bg-audifyx-purple/50 text-white text-xs ml-2 tracking-wide animate-pulse">BETA 1.0</span>
            </h1>
            
            <div className="mb-8">
              <Card className="bg-gradient-to-br from-audifyx-purple-dark/70 to-black/60 p-6 rounded-2xl shadow-vivid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={campaignData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="impressions" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="engagements" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-audifyx-purple-dark/70 p-4 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Active Campaigns</div>
                </CardContent>
              </Card>
              <Card className="bg-audifyx-purple-dark/70 p-4 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Creator Partnerships</div>
                </CardContent>
              </Card>
              <Card className="bg-audifyx-purple-dark/70 p-4 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Total Conversions</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-audifyx-purple-dark/70 rounded-2xl p-8 flex flex-col gap-3 shadow-md">
                <h2 className="text-xl font-bold mb-2">Manage Campaigns</h2>
                <Button 
                  className="bg-gradient-to-r from-audifyx-blue to-audifyx-purple text-white text-lg shadow-xl"
                  onClick={handleFeatureClick}
                >
                  Create Campaign
                </Button>
                <p className="text-gray-400 text-xs mt-2">Launch targeted campaigns with creator partnerships.</p>
              </div>
              <div className="bg-audifyx-blue/60 rounded-2xl p-8 flex flex-col gap-3 shadow-md">
                <h2 className="text-xl font-bold mb-2">Creator Marketplace</h2>
                <Button 
                  className="bg-gradient-to-r from-audifyx-purple to-audifyx-charcoal text-lg text-white font-bold shadow"
                  onClick={handleFeatureClick}
                >
                  Browse Creators
                </Button>
                <p className="text-xs text-gray-200 mt-2">Find and partner with top music creators for your campaigns.</p>
              </div>
              <div className="bg-gradient-to-tr from-audifyx-green/30 to-audifyx-purple-dark/30 rounded-2xl p-8 flex flex-col gap-3 shadow-lg">
                <h2 className="text-xl font-bold mb-2">Analytics Dashboard</h2>
                <Button 
                  className="bg-gradient-to-r from-audifyx-green to-audifyx-purple"
                  onClick={handleFeatureClick}
                >
                  View Analytics
                </Button>
                <p className="text-green-200 text-xs mt-2">Comprehensive analytics for your brand campaigns.</p>
              </div>
              <div className="bg-gradient-to-tr from-audifyx-charcoal/90 to-audifyx-blue/60 rounded-2xl p-8 flex flex-col gap-3 shadow-lg">
                <h2 className="text-xl font-bold mb-2">Audience Insights</h2>
                <Button 
                  variant="outline" 
                  className="border-audifyx-purple/30"
                  onClick={handleFeatureClick}
                >
                  Explore Demographics
                </Button>
                <p className="text-gray-200 text-xs mt-2">
                  Understand your audience with detailed demographic and engagement data.
                </p>
              </div>
            </div>
            <div className="mt-10 text-center text-gray-400">
              Have a feature request for the Brand Hub? <Button variant="link" onClick={handleFeatureClick}>Request Feature</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
