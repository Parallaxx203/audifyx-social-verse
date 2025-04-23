
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export default function LiveStream() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8 px-4`}>
          <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Video className="w-6 h-6"/> Watch Creators Live Now
            </h1>
            <div className="mb-6">
              <Button variant="outline" className="mr-4 border-audifyx-purple/30 hover:bg-audifyx-purple/20">
                Connect Twitch
              </Button>
              <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                Go Live
              </Button>
            </div>
            <div className="bg-audifyx-purple-dark/70 rounded-xl p-8 text-center">
              <p className="text-gray-300">Live streams from your favorite creators will appear here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
