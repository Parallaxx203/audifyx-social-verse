import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { SocialFeed } from "@/components/dashboard/social-feed";

export default function Dashboard() {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Get account type from user metadata
  const accountType = user?.user_metadata?.accountType || "listener";

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />

        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4 md:p-8`}>
          {/* Banner */}
          <Card className="mb-8 border-audifyx-purple/20 bg-gradient-to-br from-audifyx-purple/20 to-audifyx-blue/20 backdrop-blur-sm overflow-hidden">
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
                <Button size="lg" className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                  {accountType === 'listener' && 'Explore Tracks'}
                  {accountType === 'creator' && 'Upload Track'}
                  {accountType === 'brand' && 'Create Campaign'}
                </Button>
                <Button size="lg" variant="outline" className="border-audifyx-purple/30 hover:bg-audifyx-purple/20">
                  {accountType === 'listener' && 'View Profile'}
                  {accountType === 'creator' && 'Creator Hub'}
                  {accountType === 'brand' && 'Brand Hub'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stories */}
          <section className="mb-8 overflow-x-auto">
            <div className="flex gap-4 pb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-audifyx-purple to-audifyx-blue p-[2px]">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                  </div>
                  <p className="text-xs text-center mt-1 truncate w-20">User {i + 1}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Social Feed */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Your Feed</h3>
              <Button variant="ghost" size="sm">
                Refresh
              </Button>
            </div>
            <div className="space-y-4">
              <Card className="border-audifyx-purple/20 bg-gradient-to-br from-audifyx-purple/20 to-audifyx-blue/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-audifyx-purple/30" />
                    <div>
                      <p className="font-semibold">Creator Name</p>
                      <p className="text-sm text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <p className="mb-4">Just dropped a new track! Check it out 🎵</p>
                  <div className="rounded-lg bg-audifyx-purple/20 p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎵</span>
                      <div>
                        <p className="font-medium">New Track Title</p>
                        <p className="text-sm text-gray-400">3:45</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" /> 42
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" /> 12
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Latest Tracks Section */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Latest Tracks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {accountType === "creator" ? (
                <Card className="music-card">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-48">
                    <p className="text-gray-400 text-center">Upload your first track to get started!</p>
                    <Button className="mt-4 bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                      Upload Track
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="music-card">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-48">
                    <p className="text-gray-400 text-center">No tracks yet. Follow creators to see their music here!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Recent Posts Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Recent Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-audifyx-purple/20 bg-gradient-card">
                <CardContent className="p-6 flex flex-col items-center justify-center h-48">
                  <p className="text-gray-400 text-center">Create your first post or follow others to see their content here!</p>
                  {accountType !== "brand" && (
                    <Button className="mt-4 bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                      Create Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}