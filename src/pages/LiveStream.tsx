
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TwitchIntegrationPanel } from "@/components/profile/TwitchIntegrationPanel";

export default function LiveStream() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const accountType = user?.user_metadata?.accountType || 'listener';

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Live Stream</h1>
            
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
                  
                  <div className="bg-audifyx-purple/20 rounded-lg p-3 mb-4">
                    <div className="text-xs text-audifyx-purple-vivid">LIVE</div>
                    <div className="text-sm font-bold">Audifyx Live Stream</div>
                  </div>
                  
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-audifyx-purple/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl">🎵</span>
                      </div>
                      <div className="text-lg font-bold">Live Streaming</div>
                      <div className="text-sm text-gray-400">Coming Soon</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-around mt-4 py-4">
                    <div className="w-10 h-10 rounded-full bg-audifyx-purple flex items-center justify-center">
                      <span>🎤</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-audifyx-purple flex items-center justify-center">
                      <span>📹</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <span>✕</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Display integration panel for creators */}
            {accountType === 'creator' && (
              <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30 mb-6">
                <CardHeader>
                  <CardTitle>Prepare for Streaming</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">Connect your Twitch account to start streaming when this feature goes live.</p>
                  <TwitchIntegrationPanel />
                </CardContent>
              </Card>
            )}
            
            {/* Footer note */}
            <div className="text-center mt-8 text-gray-400">
              <p>We're working hard to bring you the best live streaming experience.</p>
              <p className="mt-2">Sign up for our newsletter to be notified when this feature launches!</p>
              
              <Button className="mt-4 bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                Join Waitlist
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
        `}
      </style>
    </div>
  );
}
