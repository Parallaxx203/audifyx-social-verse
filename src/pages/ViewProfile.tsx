
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { Music, Users, Star, MessageCircle } from "lucide-react";

export default function ViewProfile() {
  const { username } = useParams();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const { data: profile } = useProfile(user?.id);

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4 md:p-8`}>
          {/* Profile Header */}
          <div className="mb-8">
            <div className="relative">
              <div className="h-48 bg-gradient-to-r from-audifyx-purple to-audifyx-blue rounded-lg" />
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-background" />
              </div>
            </div>
            <div className="mt-16 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">@{username}</h1>
                <p className="text-gray-400">Artist • Producer</p>
              </div>
              <div className="flex gap-2">
                <Button>Follow</Button>
                <Button variant="outline">Message</Button>
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>2.4k followers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>150 following</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>12 tracks</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="tracks">
            <TabsList>
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((track) => (
                  <Card key={track} className="bg-audifyx-purple-dark/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-audifyx-purple/30 rounded-lg flex items-center justify-center">
                          <Music className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Track Title {track}</h3>
                          <p className="text-sm text-gray-400">3:45 • Released 2 weeks ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <div className="space-y-4">
                {[1, 2].map((post) => (
                  <Card key={post} className="bg-audifyx-purple-dark/30">
                    <CardContent className="p-4">
                      <p>Example post content {post}</p>
                      <div className="flex gap-4 mt-4">
                        <Button variant="ghost" size="sm">Like</Button>
                        <Button variant="ghost" size="sm">Comment</Button>
                        <Button variant="ghost" size="sm">Share</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <Card className="bg-audifyx-purple-dark/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">About</h3>
                  <p className="text-gray-300 mb-4">
                    Music producer and artist passionate about creating unique sounds.
                  </p>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400">Joined:</span> January 2024
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400">Location:</span> New York, USA
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
