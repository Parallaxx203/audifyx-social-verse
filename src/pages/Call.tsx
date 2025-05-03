
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export default function Call() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Call</h1>
              <p className="text-gray-400">Connect with other users</p>
            </div>

            <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
              <CardHeader>
                <CardTitle>Voice & Video Calls</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-audifyx-purple/20 p-6 mb-6">
                  <Phone className="h-12 w-12 text-audifyx-purple" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Coming Soon</h3>
                <p className="text-gray-400 text-center max-w-md mb-6">
                  We're working hard to bring you a seamless calling experience. Stay tuned for updates!
                </p>
                <Button disabled className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                  Start a Call
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
