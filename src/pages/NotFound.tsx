
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-audifyx flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <Logo size="lg" className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-gradient">404</h1>
        <p className="text-xl text-gray-300 mb-8">Oops! This page doesn't exist in the Audifyx universe.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
          <Button 
            variant="outline"
            className="border-audifyx-purple/30 hover:bg-audifyx-purple/20"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
