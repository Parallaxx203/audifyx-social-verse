import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { MediaUploader } from "@/components/ui/media-uploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BrandHub() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignBudget, setCampaignBudget] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const handleCreateCampaign = async () => {
    if (!campaignTitle || !campaignBudget || !mediaUrl) {
      toast({ title: "Please fill in all required fields and upload media" });
      return;
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          title: campaignTitle,
          description: campaignDescription,
          budget: parseFloat(campaignBudget),
          brand_id: user?.id,
          status: 'active',
          media_url: mediaUrl
        });

      if (error) throw error;

      toast({ title: "Campaign created and published!" });
      setCampaignTitle("");
      setCampaignBudget("");
      setCampaignDescription("");
      setMediaUrl("");
    } catch (error) {
      toast({ title: "Error creating campaign", variant: "destructive" });
    }
  };

  const handleMediaUpload = (url: string) => {
    setMediaUrl(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-audifyx-blue/90 to-audifyx-purple text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <Tabs defaultValue="create">
            <TabsList>
              <TabsTrigger value="create">Create Campaign</TabsTrigger>
              <TabsTrigger value="active">Active Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card className="bg-audifyx-purple-dark/70 p-6">
                <CardHeader>
                  <CardTitle>Create New Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Campaign Title"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Budget (USD)"
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(e.target.value)}
                  />
                  <Textarea
                    placeholder="Campaign Description"
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                  />
                  <div className="space-y-2">
                    <label className="text-sm">Upload Campaign Media</label>
                    <MediaUploader
                      onUploadComplete={handleMediaUpload}
                      allowedTypes="both"
                      userId={user?.id || ""}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateCampaign}
                    className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                  >
                    Create & Publish Campaign
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              {/* Active campaigns will be fetched from database */}
            </TabsContent>

            <TabsContent value="analytics">
              {/* Real analytics will be implemented */}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}