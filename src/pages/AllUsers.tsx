
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { User } from "lucide-react";

export default function AllUsers() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} pb-8 px-4`}>
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <User className="w-6 h-6"/> All Users
            </h1>
            <div className="bg-audifyx-purple-dark/70 rounded-xl p-8">
              <p className="text-gray-300">A list of all registered users will appear here.</p>
              {/* Hook up Supabase data fetch here */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
