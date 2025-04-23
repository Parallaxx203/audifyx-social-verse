
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Messages() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8 px-4`}>
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6"/> Messages
            </h1>
            <div className="bg-audifyx-purple-dark/70 rounded-xl p-8 mb-8">
              <p className="text-gray-300">Chat with your connections in real time.</p>
              {/* Placeholder for messages list and threads */}
              <div className="mt-4">
                <Button size="sm" className="bg-audifyx-purple">Start a New Message</Button>
              </div>
            </div>
            <div className="bg-audifyx-purple-dark/60 rounded-xl p-6 text-center">
              <p className="text-gray-400">DM threads and inbox will be shown here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
