import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Music,
  Video,
  Compass,
  MessageSquare,
  PhoneCall,
  Settings,
  Users,
  Menu,
  LogOut,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

interface Route {
  label: string;
  path: string;
  icon: string;
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const routes: Route[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "dashboard",
    },
    {
      label: "My Tracks",
      path: "/my-tracks",
      icon: "music",
    },
    {
      label: "Creator Hub",
      path: "/creator-hub",
      icon: "music",
    },
    {
      label: "Live Stream",
      path: "/live-stream",
      icon: "video",
    },
    {
      label: "Social Room", 
      path: "/social-room",
      icon: "users", 
    },
    {
      label: "Discover",
      path: "/discover",
      icon: "compass",
    },
    {
      label: "Messages",
      path: "/messages",
      icon: "messages",
    },
    {
      label: "Call",
      path: "/call",
      icon: "phone",
    },
    {
      label: "Settings",
      path: "/settings",
      icon: "settings",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpen(false); // Close the sidebar in mobile view after navigation
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-6 py-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-3 flex flex-col space-y-1">
            <span className="font-semibold">{user?.user_metadata?.full_name}</span>
            <span className="text-xs text-gray-400">{user?.email}</span>
          </div>
        </div>
        <nav className="flex-1">
          <ScrollArea className="h-full">
            <div className="px-3 py-4">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Button
                    key={route.label}
                    variant="ghost"
                    className="w-full justify-start h-9"
                    onClick={() => handleNavigation(route.path)}
                  >
                    {route.icon === "dashboard" && <LayoutDashboard className="mr-2 h-4 w-4" />}
                    {route.icon === "music" && <Music className="mr-2 h-4 w-4" />}
                    {route.icon === "video" && <Video className="mr-2 h-4 w-4" />}
                    {route.icon === "compass" && <Compass className="mr-2 h-4 w-4" />}
                    {route.icon === "messages" && <MessageSquare className="mr-2 h-4 w-4" />}
                    {route.icon === "phone" && <PhoneCall className="mr-2 h-4 w-4" />}
                    {route.icon === "settings" && <Settings className="mr-2 h-4 w-4" />}
                    {route.icon === "users" && <Users className="mr-2 h-4 w-4" />}
                    {route.label}
                  </Button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </nav>
        <div className="px-6 py-3 flex items-center justify-between">
          <ModeToggle />
          <Button variant="ghost" className="h-9 w-9" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-3/4 bg-gradient-audifyx text-white">
          <SheetHeader className="text-left mt-0">
            <SheetTitle>Audifyx</SheetTitle>
            <SheetDescription>Navigate your account</SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-20 flex flex-col h-screen bg-gradient-audifyx text-white w-64">
      <SidebarContent />
    </aside>
  );
}
