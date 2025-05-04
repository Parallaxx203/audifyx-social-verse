
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
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-audifyx-purple-dark/50 via-audifyx-purple/50 to-audifyx-purple-dark/50 text-white rounded-lg p-0 overflow-hidden">
        <div className="welcome-banner-container">
          <div className="welcome-banner">
            Welcome to Audifyx – Where Sound Meets Social
          </div>
        </div>
      </div>

      {/* Stories section */}
      <div className="mb-6">
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

      <style jsx>{`
        .welcome-banner-container {
          overflow: hidden;
          white-space: nowrap;
        }
        .welcome-banner {
          display: inline-block;
          padding-left: 100%;
          animation: marquee 15s linear infinite;
          font-size: 1.25rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
        }
        @keyframes marquee {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-100%, 0);
          }
        }
      `}</style>
    </div>
  );
}
