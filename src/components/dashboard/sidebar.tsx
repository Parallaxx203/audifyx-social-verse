
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, Search, Radio, Users, MessageSquare, Phone, 
  User, Settings, Wallet, Pencil, BarChart, Menu, X, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  
  // Get account type from user metadata
  const accountType = user?.user_metadata?.accountType || "listener";

  useEffect(() => {
    // Close mobile sidebar when route changes
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const menuItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Discover", icon: Search, path: "/discover" },
    { name: "Live Stream", icon: Radio, path: "/live-stream" },
    { name: "All Users", icon: Users, path: "/users" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Call", icon: Phone, path: "/call" },
    { name: "Profile", icon: User, path: "/profile" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  // User-specific items based on account type
  if (accountType === "listener") {
    menuItems.push({ name: "Rewards Wallet", icon: Wallet, path: "/rewards" });
  } else if (accountType === "creator") {
    menuItems.push({ name: "Creator Hub", icon: Pencil, path: "/creator-hub" });
  } else if (accountType === "brand") {
    menuItems.push({ name: "Brand Hub", icon: BarChart, path: "/brand-hub" });
  }

  return (
    <>
      {/* Mobile menu toggle */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-audifyx-purple-dark text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-audifyx-purple-dark to-audifyx-charcoal border-r border-audifyx-purple/20 flex flex-col transition-transform duration-300 ease-in-out",
          isMobile && !isOpen && "-translate-x-full",
          isMobile && isOpen && "translate-x-0",
          className
        )}
      >
        <div className="flex items-center justify-center h-16 border-b border-audifyx-purple/20 py-8">
          <Logo size="md" className="mx-auto" />
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-base font-medium hover:bg-audifyx-purple/20",
                    location.pathname === item.path
                      ? "bg-audifyx-purple/20 text-audifyx-purple"
                      : "text-gray-300"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-audifyx-purple/20">
          <Button 
            variant="outline" 
            className="w-full text-gray-300 border-audifyx-purple/30 hover:border-audifyx-purple hover:bg-audifyx-purple/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
