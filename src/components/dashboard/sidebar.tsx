
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, Search, Radio, Users, MessageSquare, Phone, 
  User, Settings, Wallet, Pencil, BarChart, Menu, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

type UserType = "listener" | "creator" | "brand";

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState<UserType>("listener");
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Get user info from local storage
    const userInfo = localStorage.getItem("audifyx-user");
    if (userInfo) {
      const { accountType } = JSON.parse(userInfo);
      setUserType(accountType as UserType);
    }

    // Close mobile sidebar when route changes
    setIsOpen(false);
  }, [location.pathname]);

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

  // User-specific items
  if (userType === "listener") {
    menuItems.push({ name: "Rewards Wallet", icon: Wallet, path: "/rewards" });
  } else if (userType === "creator") {
    menuItems.push({ name: "Creator Hub", icon: Pencil, path: "/creator-hub" });
  } else if (userType === "brand") {
    menuItems.push({ name: "Brand Hub", icon: BarChart, path: "/brand-hub" });
  }

  const handleLogout = () => {
    localStorage.removeItem("audifyx-user");
    navigate("/");
  };

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
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
