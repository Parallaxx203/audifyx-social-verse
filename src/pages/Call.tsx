import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, UserPlus } from "lucide-react";

export default function Call() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetUserId = searchParams.get("user");
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Call</h1>
            
            {/* Marquee banner */}
            <div className="bg-audifyx-purple/30 rounded-lg p-4 mb-8 overflow-hidden">
              <div className="marquee">
                <span className="text-lg font-bold text-audifyx-purple-vivid">
                  Feature coming soon – stay tuned! &nbsp;&nbsp;&nbsp; Feature coming soon – stay tuned! &nbsp;&nbsp;&nbsp;
                  Feature coming soon – stay tuned! &nbsp;&nbsp;&nbsp; Feature coming soon – stay tuned!
                </span>
              </div>
            </div>
            
            {/* Call interface mockup */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              {/* Video preview */}
              <div className="lg:w-2/3">
                <Card className="bg-audifyx-purple-dark/70 border-audifyx-purple/30 h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-audifyx-purple/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="text-xl font-bold">Video Preview</div>
                    <div className="text-sm text-gray-400 mt-2">Camera access will be available when this feature launches</div>
                  </div>
                </Card>
                
                {/* Call controls */}
                <div className="flex justify-center gap-4 mt-6">
                  <Button 
                    className={`rounded-full w-12 h-12 p-0 ${isMuted ? 'bg-red-500' : 'bg-audifyx-purple'}`}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                  
                  <Button 
                    className="rounded-full w-14 h-14 p-0 bg-red-500 hover:bg-red-600"
                  >
                    <PhoneOff className="h-7 w-7" />
                  </Button>
                  
                  <Button 
                    className={`rounded-full w-12 h-12 p-0 ${isVideoOn ? 'bg-audifyx-purple' : 'bg-red-500'}`}
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                  </Button>
                  
                  <Button 
                    className="rounded-full w-12 h-12 p-0 bg-audifyx-purple"
                  >
                    <UserPlus className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              {/* Call info & participants */}
              <div className="lg:w-1/3 space-y-4">
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>Call Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Call with</p>
                        <p className="font-bold">{targetUserId ? `User ID: ${targetUserId}` : 'No user selected'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Duration</p>
                        <p className="font-bold">00:00:00</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
                          <span>Waiting for feature release</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                  <CardHeader>
                    <CardTitle>Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-audifyx-purple/20 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-audifyx-purple/60 rounded-full"></div>
                          <span>You</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mic className="h-4 w-4 text-audifyx-purple" />
                          <Video className="h-4 w-4 text-audifyx-purple" />
                        </div>
                      </div>
                      
                      {targetUserId && (
                        <div className="flex items-center justify-between p-2 bg-audifyx-purple/20 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-audifyx-purple/60 rounded-full"></div>
                            <span>Recipient</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mic className="h-4 w-4 text-gray-400" />
                            <Video className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Feature note */}
            <div className="text-center mt-8 text-gray-400">
              <p>Our advanced calling features are currently in development.</p>
              <p className="mt-2">Stay tuned for high-quality audio/video calls with other Audifyx users!</p>
              
              <Button className="mt-4 bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                Join Beta Testing
              </Button>
            </div>
          </div>
        </main>
      </div>
      
      <style>
        {`
        .marquee {
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .call-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        
        .button-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
        }
        
        @media (max-width: 640px) {
          .button-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        `}
      </style>
    </div>
  );
}
