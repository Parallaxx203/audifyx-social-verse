
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MiniPhone } from "@/components/dashboard/mini-phone";
import { Mic, Music, Heart, BarChart2 } from "lucide-react";

type UserRole = 'listener' | 'creator' | 'brand';

export function PlatformPreview() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('listener');
  const [activeTab, setActiveTab] = useState("discover");

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4 text-center">Experience Audifyx as a:</h3>
        <div className="flex justify-center gap-4">
          <button 
            className={`px-6 py-3 rounded-full transition-all ${
              selectedRole === 'listener' 
                ? 'bg-audifyx-purple text-white' 
                : 'bg-audifyx-charcoal/50 text-gray-300 hover:bg-audifyx-charcoal'
            }`}
            onClick={() => handleRoleChange('listener')}
          >
            Listener
          </button>
          <button 
            className={`px-6 py-3 rounded-full transition-all ${
              selectedRole === 'creator' 
                ? 'bg-audifyx-purple text-white' 
                : 'bg-audifyx-charcoal/50 text-gray-300 hover:bg-audifyx-charcoal'
            }`}
            onClick={() => handleRoleChange('creator')}
          >
            Creator
          </button>
          <button 
            className={`px-6 py-3 rounded-full transition-all ${
              selectedRole === 'brand' 
                ? 'bg-audifyx-purple text-white' 
                : 'bg-audifyx-charcoal/50 text-gray-300 hover:bg-audifyx-charcoal'
            }`}
            onClick={() => handleRoleChange('brand')}
          >
            Brand
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <div className="w-[280px] h-[580px]">
            <MiniPhone accountType={selectedRole} />
          </div>
        </div>

        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="discover">
                <Music className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
              <TabsTrigger value="create">
                <Mic className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </TabsTrigger>
              <TabsTrigger value="engage">
                <Heart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Engage</span>
              </TabsTrigger>
              <TabsTrigger value="earn">
                <BarChart2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Earn</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-4">
              <Card className="bg-audifyx-purple/20 border-audifyx-purple/30">
                <CardHeader>
                  <CardTitle>Discover Amazing Music</CardTitle>
                  <CardDescription>
                    Find your next favorite artists and tracks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRole === 'listener' && (
                    <p>Browse personalized recommendations and trending tracks from emerging artists.</p>
                  )}
                  {selectedRole === 'creator' && (
                    <p>Get discovered by new fans and connect with other artists in your genre.</p>
                  )}
                  {selectedRole === 'brand' && (
                    <p>Discover emerging talent and identify potential brand ambassadors.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card className="bg-audifyx-purple/20 border-audifyx-purple/30">
                <CardHeader>
                  <CardTitle>Create & Share</CardTitle>
                  <CardDescription>
                    Express yourself on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRole === 'listener' && (
                    <p>Share your thoughts on your favorite music and create playlists to share with friends.</p>
                  )}
                  {selectedRole === 'creator' && (
                    <p>Upload tracks, photos, and videos to showcase your artistic journey.</p>
                  )}
                  {selectedRole === 'brand' && (
                    <p>Design campaigns that resonate with music fans and partner with authentic creators.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engage" className="space-y-4">
              <Card className="bg-audifyx-purple/20 border-audifyx-purple/30">
                <CardHeader>
                  <CardTitle>Engage With Community</CardTitle>
                  <CardDescription>
                    Connect with like-minded music lovers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRole === 'listener' && (
                    <p>Follow your favorite creators, join discussions, and attend live streams.</p>
                  )}
                  {selectedRole === 'creator' && (
                    <p>Interact directly with your fans, collaborate with other artists, and build your audience.</p>
                  )}
                  {selectedRole === 'brand' && (
                    <p>Engage authentically with music communities and build brand loyalty among fans.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earn" className="space-y-4">
              <Card className="bg-audifyx-purple/20 border-audifyx-purple/30">
                <CardHeader>
                  <CardTitle>Earn Rewards</CardTitle>
                  <CardDescription>
                    Get rewarded for your participation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRole === 'listener' && (
                    <p>Earn points for interactions that you can redeem for exclusive content and experiences.</p>
                  )}
                  {selectedRole === 'creator' && (
                    <p>Monetize your content through brand partnerships, fan support, and platform rewards.</p>
                  )}
                  {selectedRole === 'brand' && (
                    <p>See measurable ROI on your campaigns and build lasting relationships with creators.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
