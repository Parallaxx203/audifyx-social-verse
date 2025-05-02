
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
    <div className="min-h-screen bg-gradient-audifyx text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo size="md" />
        <Button 
          variant="ghost" 
          className="border border-audifyx-purple/30 hover:bg-audifyx-purple/20"
          onClick={() => navigate("/auth")}
        >
          Login
        </Button>
      </header>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight font-handwriting">
              The Social Music Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed font-handwriting">
              Connect with creators, share your favorite music, and earn rewards in a vibrant community built for music creators.
            </p>
            <div className="flex flex-col gap-4">
              <Button 
                size="lg"
                className="bg-audifyx-purple hover:bg-audifyx-purple-vivid text-lg w-full sm:w-auto"
                onClick={() => handleSignUp('user')}
              >
                Join as Listener
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-audifyx-purple/30 hover:bg-audifyx-purple/20 text-lg w-full sm:w-auto"
                onClick={() => handleSignUp('creator')}
              >
                Join as Creator
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-audifyx-purple/30 hover:bg-audifyx-purple/20 text-lg w-full sm:w-auto"
                onClick={() => handleSignUp('brand')}
              >
                Join as Brand
              </Button>
            </div>
          </div>
          
          <div className="animate-float">
            <DashboardPreview />
          </div>
        </div>
      </section>
      
      {/* Platform Preview Section */}
      <section className="container mx-auto px-4 py-16 bg-audifyx-charcoal/30 rounded-lg">
        <h2 className="text-3xl font-bold mb-10 text-center">Experience Audifyx</h2>
        <PlatformPreview />
      </section>
      
      {/* Info Tabs Section */}
      <section className="container mx-auto px-4 py-16">
        <InfoTabs />
      </section>
      
      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-audifyx-purple/20">
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
    </div>
  );
}
