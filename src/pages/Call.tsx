
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneCall, PhoneOff } from "lucide-react";

export default function Call() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Call Center</h1>
            
            {/* Marquee banner */}
            <div className="bg-audifyx-purple/30 rounded-lg p-4 mb-8 overflow-hidden">
              <div className="marquee">
                <span className="text-lg font-bold text-audifyx-purple-vivid">
                  Feature coming soon – stay tuned! &nbsp;&nbsp;&nbsp; Feature coming soon – stay tuned! &nbsp;&nbsp;&nbsp;
                  Feature coming soon – stay tuned! &nbsp;&nbsp;&nbsp; Feature coming soon – stay tuned!
                </span>
              </div>
            </div>
            
            {/* Mobile phone mockup */}
            <div className="flex justify-center mb-8">
              <div className="w-64 h-[500px] bg-audifyx-purple-dark/50 rounded-3xl border-4 border-audifyx-purple/30 overflow-hidden relative">
                <div className="w-32 h-8 bg-audifyx-purple-dark rounded-b-xl absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                <div className="p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <div>9:41</div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-audifyx-purple"></div>
                      <div className="w-3 h-3 rounded-full bg-audifyx-purple"></div>
                      <div className="w-3 h-3 rounded-full bg-audifyx-purple"></div>
                    </div>
                  </div>
                  
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-audifyx-purple/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <PhoneCall size={36} className="text-audifyx-purple-vivid" />
                      </div>
                      <div className="text-lg font-bold">Audio & Video Calls</div>
                      <div className="text-sm text-gray-400 mb-6">Coming Soon</div>
                      <div className="text-xs text-gray-400">Connect with other creators and fans</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-around mt-4 py-4 gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <Phone size={24} />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                      <PhoneOff size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <CardHeader>
                  <CardTitle>HD Audio Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Crystal-clear audio quality for the ultimate communication experience with fans and collaborators.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <CardHeader>
                  <CardTitle>Video Conferencing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Face-to-face interactions with multiple participants, ideal for virtual meet-and-greets.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
                <CardHeader>
                  <CardTitle>Screen Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Share your screen during calls to showcase your work, productions, or collaborate on projects.</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Footer note */}
            <div className="text-center mt-8 text-gray-400">
              <p>We're working hard to bring you the best calling experience.</p>
              <p className="mt-2">Sign up for our newsletter to be notified when this feature launches!</p>
              
              <Button className="mt-4 bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                Join Waitlist
              </Button>
            </div>
          </div>
        </main>
      </div>
      
      <style jsx>{`
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
      `}</style>
    </div>
  );
}
