
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function BrandHub() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - replace with real API calls
  const campaignData = [
    { day: "Mon", impressions: 400, engagements: 240, conversions: 20 },
    { day: "Tue", impressions: 300, engagements: 139, conversions: 15 },
    { day: "Wed", impressions: 200, engagements: 980, conversions: 45 },
    { day: "Thu", impressions: 278, engagements: 390, conversions: 30 },
    { day: "Fri", impressions: 189, engagements: 480, conversions: 25 },
    { day: "Sat", impressions: 239, engagements: 380, conversions: 28 },
    { day: "Sun", impressions: 349, engagements: 430, conversions: 32 },
  ];

  const audienceData = [
    { name: 'Hip-Hop', value: 400 },
    { name: 'Rock', value: 300 },
    { name: 'Pop', value: 300 },
    { name: 'Electronic', value: 200 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-audifyx-blue/90 to-audifyx-purple text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold drop-shadow">
                <span className="bg-gradient-to-r from-audifyx-purple to-audifyx-blue text-transparent bg-clip-text">
                  Brand Hub
                </span>
              </h1>
              <Button onClick={() => toast({ title: "Coming Soon", description: "Campaign creation will be available soon!" })}>
                Create Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-audifyx-purple-dark/70 p-4">
                <CardContent className="text-center">
                  <h3 className="text-xl mb-2">Total Reach</h3>
                  <p className="text-3xl font-bold">124.5K</p>
                  <p className="text-green-400 text-sm">+12.3% this week</p>
                </CardContent>
              </Card>
              <Card className="bg-audifyx-purple-dark/70 p-4">
                <CardContent className="text-center">
                  <h3 className="text-xl mb-2">Engagement Rate</h3>
                  <p className="text-3xl font-bold">8.7%</p>
                  <p className="text-green-400 text-sm">+2.1% this week</p>
                </CardContent>
              </Card>
              <Card className="bg-audifyx-purple-dark/70 p-4">
                <CardContent className="text-center">
                  <h3 className="text-xl mb-2">Active Campaigns</h3>
                  <p className="text-3xl font-bold">3</p>
                  <p className="text-blue-400 text-sm">2 pending approval</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-audifyx-purple-dark/30">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="creators">Creator Network</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-audifyx-purple-dark/70 p-4">
                    <CardHeader>
                      <CardTitle>Campaign Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={campaignData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="impressions" stroke="#8884d8" />
                          <Line type="monotone" dataKey="engagements" stroke="#82ca9d" />
                          <Line type="monotone" dataKey="conversions" stroke="#ffc658" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-audifyx-purple-dark/70 p-4">
                    <CardHeader>
                      <CardTitle>Audience Demographics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={audienceData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label
                          >
                            {audienceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="campaigns">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((campaign) => (
                    <Card key={campaign} className="bg-audifyx-purple-dark/70 p-4">
                      <CardHeader>
                        <CardTitle>Campaign {campaign}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p>Status: Active</p>
                          <p>Budget: $1,000</p>
                          <p>ROI: 2.4x</p>
                          <Button className="w-full mt-4">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="creators">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((creator) => (
                    <Card key={creator} className="bg-audifyx-purple-dark/70 p-4">
                      <CardContent>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-audifyx-purple"></div>
                          <div>
                            <h3 className="font-bold">Creator {creator}</h3>
                            <p className="text-sm text-gray-400">100K followers</p>
                          </div>
                        </div>
                        <Button className="w-full mt-4">View Profile</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <Card className="bg-audifyx-purple-dark/70 p-6">
                  <CardHeader>
                    <CardTitle>Advanced Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>Detailed analytics dashboard coming soon!</p>
                      <Button>Export Reports</Button>
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
