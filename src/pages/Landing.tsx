
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { InfoTabs } from "@/components/landing/info-tabs";
import { PlatformPreview } from "@/components/landing/PlatformPreview";

export default function Landing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem("audifyx-user");
    if (userInfo) {
      setIsLoggedIn(true);
      navigate("/dashboard");
    }
  }, [navigate]);
  
  if (isLoggedIn) {
    return null;
  }
  
  const handleSignUp = (accountType: 'user' | 'creator' | 'brand') => {
    navigate("/auth", { 
      state: { 
        defaultTab: "signup",
        accountType 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-audifyx-purple/20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-audifyx-blue/20 blur-3xl animate-float"></div>
      </div>
      
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
        <Logo size="md" />
        <Button 
          variant="ghost" 
          className="border border-audifyx-purple/30 hover:bg-audifyx-purple/20 transition-all duration-300"
          onClick={() => navigate("/auth")}
        >
          Login
        </Button>
      </header>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <h1 className="landing-header text-4xl md:text-5xl font-bold mb-6 leading-tight font-handwriting">
              Welcome to Audifyx
            </h1>
            <p className="landing-subtext text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Discover new music, connect with artists, and join a vibrant creator-powered community where every sound earns rewards.
            </p>
            <div className="flex flex-col gap-4">
              <Button 
                size="lg"
                className="btn bg-gradient-to-r from-audifyx-purple to-audifyx-blue hover:from-audifyx-purple-vivid hover:to-audifyx-blue text-lg w-full sm:w-auto transition-all duration-300"
                onClick={() => handleSignUp('user')}
              >
                Join as Listener
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="btn-outline border-audifyx-purple/30 hover:bg-audifyx-purple/20 text-lg w-full sm:w-auto transition-all duration-300"
                onClick={() => handleSignUp('creator')}
              >
                Join as Creator
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="btn-outline border-audifyx-purple/30 hover:bg-audifyx-purple/20 text-lg w-full sm:w-auto transition-all duration-300"
                onClick={() => handleSignUp('brand')}
              >
                Join as Brand
              </Button>
            </div>
          </div>
          
          <div className="animate-float relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-audifyx-purple/50 to-audifyx-blue/50 rounded-lg blur-lg"></div>
            <DashboardPreview />
          </div>
        </div>
      </section>
      
      {/* Platform Preview Section */}
      <section className="container mx-auto px-4 py-16 bg-audifyx-charcoal/30 rounded-lg backdrop-blur-sm relative z-10">
        <h2 className="text-3xl font-bold mb-10 text-center">Experience Audifyx</h2>
        <PlatformPreview />
      </section>
      
      {/* Info Tabs Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <InfoTabs />
      </section>
      
      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-audifyx-purple/20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 Audifyx. All rights reserved.</p>
          
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-audifyx-purple transition">
              Discord
            </a>
            <a href="#" className="text-gray-400 hover:text-audifyx-purple transition">
              Instagram
            </a>
            <a href="#" className="text-gray-400 hover:text-audifyx-purple transition">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-audifyx-purple transition">
              Privacy
            </a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing-header {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 1s ease-in-out forwards;
        }

        .landing-subtext {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 1.5s ease-in-out forwards;
        }

        .btn {
          transition: all 0.3s ease-in-out;
        }
        
        .btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(138, 43, 226, 0.6);
        }
        
        .btn-outline:hover {
          transform: scale(1.05);
          box-shadow: 0 0 10px rgba(138, 43, 226, 0.4);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
