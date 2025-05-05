import { useState } from "react";
import {
  Home,
  Compass,
  Video,
  MessageSquare,
  Users,
  BarChart2,
  User,
  Settings,
  DollarSign,
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface SidebarItemProps {
  label: string;
  icon: any;
  to: string;
}

export function Sidebar() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const toggleSheet = () => setIsSheetOpen(!isSheetOpen);

  const closeSheet = () => setIsSheetOpen(false);

  const SidebarItem = ({ label, icon: Icon, to }: SidebarItemProps) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} onClick={isMobile ? closeSheet : undefined}>
        <div
          className={`flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer hover:bg-audifyx-purple/10 ${isActive ? 'bg-audifyx-purple/20' : ''
            }`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
      </Link>
    );
  };

  const sidebarItems = [
    { label: "Home", icon: Home, to: "/" },
    { label: "Discover", icon: Compass, to: "/discover" },
    { label: "Live Stream", icon: Video, to: "/live-stream" },
    { label: "Messages", icon: MessageSquare, to: "/messages" },
    { label: "Social Room", icon: Users, to: "/social-room" },
    { label: "Leaderboard", icon: BarChart2, to: "/leaderboard" }, // Replace My Tracks with Leaderboard
    { label: "Profile", icon: User, to: "/profile" },
    { label: "Settings", icon: Settings, to: "/settings" },
    { label: "Payout", icon: DollarSign, to: "/payout-request" }
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>{user?.user_metadata?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold">{user?.user_metadata?.username}</div>
          <div className="text-sm text-gray-400">
            {user?.user_metadata?.accountType || "Listener"}
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="py-2">
          {sidebarItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Menu className="absolute top-4 left-4 h-6 w-6 text-white cursor-pointer" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-audifyx-purple-dark border-r border-audifyx-purple">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-audifyx-purple-dark border-r border-audifyx-purple">
      {renderSidebarContent()}
    </aside>
  );
}
