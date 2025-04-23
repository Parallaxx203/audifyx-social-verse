
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6"/> Settings
            </h1>
            <div className="bg-audifyx-purple-dark/70 rounded-xl p-6 space-y-6">
              <Button variant="outline" className="w-full border-audifyx-purple/30">Connect Social Accounts</Button>
              <Button variant="outline" className="w-full border-audifyx-purple/30">Privacy Settings</Button>
              <Button variant="outline" className="w-full border-audifyx-purple/30">Notification Preferences</Button>
              <Button variant="outline" className="w-full border-audifyx-purple/30">Account Information</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
