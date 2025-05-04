
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import { UploadTrackModal } from "@/components/creator/UploadTrackModal";
import { StoryComponent } from "@/components/story/StoryComponent";

export function DashboardWelcome() {
  const { user, accountType } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Stories section */}
      <div className="mb-6">
        <div className="text-center py-2 bg-gradient-to-r from-audifyx-purple-dark/50 via-audifyx-purple/50 to-audifyx-purple-dark/50 text-white rounded-lg mb-4">
          Welcome to Audifyx – Where Sound Meets Social
        </div>
        <StoryComponent />
      </div>

      {/* Conditional buttons based on account type */}
      {accountType === 'creator' && (
        <div className="flex flex-wrap gap-4 justify-center">
          <UploadTrackModal />
          <Button 
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            onClick={() => navigate('/creator-hub')}
          >
            <Music className="mr-2 h-4 w-4" />
            Creator Hub
          </Button>
        </div>
      )}

      {accountType === 'brand' && (
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            onClick={() => navigate('/brand-hub')}
          >
            Brand Hub
          </Button>
        </div>
      )}
    </div>
  );
}
