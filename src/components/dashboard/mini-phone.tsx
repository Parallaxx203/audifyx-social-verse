
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, Music, Building, Heart, MessageSquare, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MiniPhoneProps {
  accountType?: string;
}

export function MiniPhone({ accountType = "listener" }: MiniPhoneProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const username = user?.user_metadata?.username || "username";

  return (
    <div className="w-[280px] h-[550px] bg-black rounded-[32px] border-8 border-audifyx-charcoal overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center z-10">
        <div className="w-24 h-5 bg-audifyx-charcoal rounded-b-xl"></div>
      </div>
      
      <div className="h-full pt-6 pb-4 px-3">
        <div className="h-full bg-gradient-audifyx rounded-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-3 flex items-center justify-between bg-audifyx-charcoal/30 backdrop-blur-sm">
            <div className="text-xs">9:41</div>
            <div className="flex items-center gap-1">
              <div className="text-xs">4G</div>
              <div className="text-xs">100%</div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <Tabs 
              defaultValue="profile" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsContent value="profile" className="flex-1 p-2 overflow-y-auto">
                <div className="flex flex-col items-center pt-4">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-xs font-medium mb-1">@{username}</div>
                  <div className="text-[10px] text-gray-400 mb-4">
                    {accountType === 'creator' && 'Music Creator'}
                    {accountType === 'brand' && 'Brand Account'}
                    {accountType === 'listener' && 'Music Enthusiast'}
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-xs font-medium">120</div>
                      <div className="text-[10px] text-gray-400">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium">1.2K</div>
                      <div className="text-[10px] text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium">350</div>
                      <div className="text-[10px] text-gray-400">Following</div>
                    </div>
                  </div>
                  
                  <Button className="text-[10px] py-1 px-3 h-auto bg-audifyx-purple">Follow</Button>
                  
                  <div className="w-full mt-4 grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="aspect-square bg-audifyx-purple/20 rounded-md flex items-center justify-center">
                        <Music className="h-3 w-3" />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="hub" className="flex-1 p-2 overflow-y-auto">
                {accountType === 'creator' ? (
                  <div className="space-y-3 pt-2">
                    <Card className="bg-audifyx-charcoal/50 p-2">
                      <div className="text-[10px] font-medium">Creator Stats</div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-audifyx-purple/20 p-1 rounded">
                          <div className="text-[8px] text-gray-400">Plays</div>
                          <div className="text-[10px] font-medium">5.2K</div>
                        </div>
                        <div className="bg-audifyx-purple/20 p-1 rounded">
                          <div className="text-[8px] text-gray-400">Earnings</div>
                          <div className="text-[10px] font-medium">$42.30</div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-audifyx-charcoal/50 p-2">
                      <div className="text-[10px] font-medium">Latest Uploads</div>
                      <div className="mt-1 space-y-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-1 bg-audifyx-purple/10 p-1 rounded">
                            <div className="w-5 h-5 bg-audifyx-purple/20 rounded flex items-center justify-center">
                              <Music className="h-2 w-2" />
                            </div>
                            <div>
                              <div className="text-[8px] font-medium">Track {i+1}</div>
                              <div className="text-[6px] text-gray-400">2d ago</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    
                    <Button className="text-[10px] w-full py-1 h-auto bg-audifyx-purple">Upload New Track</Button>
                  </div>
                ) : accountType === 'brand' ? (
                  <div className="space-y-3 pt-2">
                    <Card className="bg-audifyx-charcoal/50 p-2">
                      <div className="text-[10px] font-medium">Campaign Performance</div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-audifyx-purple/20 p-1 rounded">
                          <div className="text-[8px] text-gray-400">Active</div>
                          <div className="text-[10px] font-medium">3</div>
                        </div>
                        <div className="bg-audifyx-purple/20 p-1 rounded">
                          <div className="text-[8px] text-gray-400">Reach</div>
                          <div className="text-[10px] font-medium">12.4K</div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-audifyx-charcoal/50 p-2">
                      <div className="text-[10px] font-medium">Recent Campaigns</div>
                      <div className="mt-1 space-y-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-1 bg-audifyx-purple/10 p-1 rounded">
                            <div className="w-5 h-5 bg-audifyx-purple/20 rounded flex items-center justify-center">
                              <Building className="h-2 w-2" />
                            </div>
                            <div>
                              <div className="text-[8px] font-medium">Campaign {i+1}</div>
                              <div className="text-[6px] text-gray-400">${(i+1)*100}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    
                    <Button className="text-[10px] w-full py-1 h-auto bg-audifyx-purple">New Campaign</Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <Card className="bg-audifyx-charcoal/50 p-2">
                      <div className="text-[10px] font-medium">Rewards</div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-audifyx-purple/20 p-1 rounded">
                          <div className="text-[8px] text-gray-400">Points</div>
                          <div className="text-[10px] font-medium">350</div>
                        </div>
                        <div className="bg-audifyx-purple/20 p-1 rounded">
                          <div className="text-[8px] text-gray-400">Value</div>
                          <div className="text-[10px] font-medium">$3.50</div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-audifyx-charcoal/50 p-2">
                      <div className="text-[10px] font-medium">Recent Activity</div>
                      <div className="mt-1 space-y-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-1 bg-audifyx-purple/10 p-1 rounded">
                            <div className="w-5 h-5 bg-audifyx-purple/20 rounded flex items-center justify-center">
                              <Wallet className="h-2 w-2" />
                            </div>
                            <div>
                              <div className="text-[8px] font-medium">Earned points</div>
                              <div className="text-[6px] text-gray-400">+5 pts</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    
                    <Button className="text-[10px] w-full py-1 h-auto bg-audifyx-purple">Redeem Rewards</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="feed" className="flex-1 p-2 overflow-y-auto">
                <div className="space-y-2 pt-2">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-audifyx-charcoal/50 p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-4 h-4 rounded-full bg-audifyx-purple/20"></div>
                        <div className="text-[8px] font-medium">user{i+1}</div>
                      </div>
                      <div className="h-[100px] bg-audifyx-purple/10 rounded mb-1 flex items-center justify-center">
                        <Music className="h-4 w-4 text-audifyx-purple/50" />
                      </div>
                      <div className="text-[8px] mb-1">This is a post caption...</div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Heart className="h-2 w-2 mr-[2px]" />
                          <span className="text-[6px]">45</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-2 w-2 mr-[2px]" />
                          <span className="text-[6px]">12</span>
                        </div>
                        <div className="flex items-center">
                          <Share2 className="h-2 w-2 mr-[2px]" />
                          <span className="text-[6px]">3</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsList className="mt-auto bg-audifyx-charcoal/50 grid grid-cols-3">
                <TabsTrigger value="profile" className="data-[state=active]:bg-audifyx-purple/20 h-8">
                  <span className="text-[10px]">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="hub" className="data-[state=active]:bg-audifyx-purple/20 h-8">
                  <span className="text-[10px]">
                    {accountType === 'creator' ? 'Creator' : 
                     accountType === 'brand' ? 'Brand' : 'Rewards'}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="feed" className="data-[state=active]:bg-audifyx-purple/20 h-8">
                  <span className="text-[10px]">Feed</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
