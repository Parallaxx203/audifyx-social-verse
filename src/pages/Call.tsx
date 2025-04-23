
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Phone, Video, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function Call() {
  const isMobile = useIsMobile();

  function handleCall(type: "audio" | "video") {
    toast({
      title: `Start ${type === "audio" ? "Audio" : "Video"} Call`,
      description: "Call functionality for users coming soon!",
    });
    // TODO: Actually kick off call session/edge function
  }

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-2xl mx-auto flex flex-col gap-8">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Phone className="w-6 h-6"/> Audio & Video Chat with Artists and Friends
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-audifyx-purple-dark/80 rounded-xl p-6 flex flex-col items-center">
                <Mic className="w-8 h-8 mb-2" />
                <p className="mb-4 text-lg">Start a voice call with artists and friends.<br/>Connect directly, discuss collaborations.</p>
                <Button className="bg-audifyx-purple" onClick={() => handleCall("audio")}>Start Audio Call</Button>
              </div>
              <div className="bg-audifyx-purple-dark/80 rounded-xl p-6 flex flex-col items-center">
                <Video className="w-8 h-8 mb-2" />
                <p className="mb-4 text-lg">Face-to-face meetings made easy.</p>
                <Button className="bg-audifyx-purple" onClick={() => handleCall("video")}>Start Video Call</Button>
              </div>
            </div>
            <div className="bg-audifyx-charcoal/70 rounded-xl p-4 mt-4">
              <h3 className="font-semibold text-lg mb-2">Future Features (Coming Soon):</h3>
              <ul className="list-disc pl-5 text-gray-300">
                <li>Livestream from Call</li>
                <li>Earn Rewards over Call</li>
                <li>Private Collab Rooms</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
