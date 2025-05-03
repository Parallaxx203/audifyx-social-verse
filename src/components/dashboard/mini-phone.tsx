
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, MessageSquare, Share2, Home, Compass, User, Mic, Play } from "lucide-react";

interface MiniPhoneProps {
  accountType?: string;
}

export function MiniPhone({ accountType = "listener" }: MiniPhoneProps) {
  const [activeTab, setActiveTab] = useState("home");
  
  return (
    <div className="w-full max-w-[300px] h-[550px] mx-auto bg-audifyx-charcoal rounded-3xl overflow-hidden border-8 border-audifyx-charcoal relative">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl z-10"></div>
      
      {/* Status bar */}
      <div className="bg-gradient-to-r from-audifyx-purple to-audifyx-blue h-10 px-4 flex items-center justify-between text-white text-xs">
        <div>9:41</div>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-white/80"></div>
          <div className="w-3 h-3 rounded-full bg-white/80"></div>
          <div className="w-3 h-3 rounded-full bg-white/80"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-audifyx-purple-dark/80 h-[calc(100%-90px)] overflow-y-auto p-3">
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Stories */}
            <div className="flex overflow-x-auto pb-2 gap-2">
              <div className="flex-shrink-0 w-16">
                <div className="w-14 h-14 bg-gradient-to-r from-audifyx-purple to-audifyx-blue p-[2px] rounded-full mx-auto">
                  <div className="w-full h-full rounded-full bg-audifyx-purple-dark flex items-center justify-center">
                    <span className="text-lg">+</span>
                  </div>
                </div>
                <p className="text-xs text-center mt-1">Your Story</p>
              </div>
              {["DJ Flow", "Beatriz", "Melody", "RhythmX"].map((name, i) => (
                <div key={i} className="flex-shrink-0 w-16">
                  <div className="w-14 h-14 bg-gradient-to-r from-audifyx-purple to-audifyx-blue p-[2px] rounded-full mx-auto">
                    <div className="w-full h-full rounded-full bg-gray-800 border-2 border-audifyx-purple-dark"></div>
                  </div>
                  <p className="text-xs text-center mt-1 truncate">{name}</p>
                </div>
              ))}
            </div>
            
            {/* Posts */}
            <div className="space-y-4">
              <div className="bg-audifyx-purple/20 rounded-lg overflow-hidden">
                <div className="p-3 flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>DJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">DJ Flow</p>
                    <p className="text-xs text-gray-400">3h ago</p>
                  </div>
                </div>
                <div className="bg-gray-800 aspect-square flex items-center justify-center">
                  <Play className="h-10 w-10 text-white/70" />
                </div>
                <div className="p-3">
                  <p className="text-sm mb-2">New track "Midnight Vibes" just dropped 🔥</p>
                  <div className="flex justify-between">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-audifyx-purple/20 rounded-lg overflow-hidden">
                <div className="p-3 flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RX</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">RhythmX</p>
                    <p className="text-xs text-gray-400">5h ago</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm">Live streaming tonight at 8PM! Don't miss it 🎵</p>
                  <div className="flex justify-between mt-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "discover" && (
          <div className="grid grid-cols-2 gap-3">
            {["Trending", "Rock", "EDM", "Hip Hop", "Jazz", "Classical"].map((genre, i) => (
              <div key={i} className="bg-audifyx-purple/20 rounded-lg aspect-square flex items-center justify-center">
                <p className="font-medium">{genre}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === "studio" && accountType === "creator" && (
          <div className="space-y-4">
            <div className="bg-audifyx-purple/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">Your Latest Tracks</h3>
              <div className="space-y-2">
                {["Midnight Vibes", "Electric Dreams", "Sunset Groove"].map((track, i) => (
                  <div key={i} className="flex items-center justify-between bg-audifyx-purple-dark/50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-audifyx-purple/30 rounded flex items-center justify-center">
                        <Mic className="h-4 w-4" />
                      </div>
                      <span className="text-sm">{track}</span>
                    </div>
                    <div className="text-xs text-gray-400">3.2k plays</div>
                  </div>
                ))}
              </div>
              <Button size="sm" className="w-full mt-3 bg-audifyx-purple">Upload New</Button>
            </div>
            
            <div className="bg-audifyx-purple/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">Analytics</h3>
              <div className="h-24 flex items-end gap-1">
                {[30, 45, 25, 60, 40, 75, 50].map((height, i) => (
                  <div key={i} className="flex-1 bg-audifyx-purple" style={{ height: `${height}%` }}></div>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2 text-center">Last 7 days - 15.4k total plays</div>
            </div>
          </div>
        )}
        
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{accountType === "creator" ? "DJ" : "U"}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold mt-2">{accountType === "creator" ? "DJ Flow" : "User123"}</h3>
              <p className="text-xs text-gray-400 mb-2">{accountType === "creator" ? "@djflow" : "@user123"}</p>
              <div className="flex gap-4 text-center text-sm">
                <div>
                  <p className="font-bold">{accountType === "creator" ? "12.4k" : "126"}</p>
                  <p className="text-xs text-gray-400">Followers</p>
                </div>
                <div>
                  <p className="font-bold">{accountType === "creator" ? "45" : "312"}</p>
                  <p className="text-xs text-gray-400">Following</p>
                </div>
                <div>
                  <p className="font-bold">{accountType === "creator" ? "32" : "0"}</p>
                  <p className="text-xs text-gray-400">Tracks</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="mt-2">Edit Profile</Button>
            </div>
            
            {accountType === "creator" && (
              <div className="bg-audifyx-purple/20 rounded-lg p-3">
                <h4 className="font-medium mb-2">Popular Tracks</h4>
                <div className="space-y-2">
                  {["Midnight Vibes", "Electric Dreams", "Sunset Groove"].map((track, i) => (
                    <div key={i} className="flex items-center gap-2 bg-audifyx-purple-dark/50 p-2 rounded">
                      <div className="w-6 h-6 bg-audifyx-purple/30 rounded flex items-center justify-center">
                        <Play className="h-3 w-3" />
                      </div>
                      <span className="text-xs">{track}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom nav */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[50px] bg-audifyx-charcoal">
        <TabsList className="w-full h-full grid-cols-4 bg-transparent">
          <TabsTrigger value="home" className="data-[state=active]:bg-audifyx-purple/20 rounded-none">
            <Home className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="discover" className="data-[state=active]:bg-audifyx-purple/20 rounded-none">
            <Compass className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="studio" className="data-[state=active]:bg-audifyx-purple/20 rounded-none">
            <Mic className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-audifyx-purple/20 rounded-none">
            <User className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
