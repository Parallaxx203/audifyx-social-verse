
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface PreviewProps {
  className?: string;
}

export function DashboardPreview({ className }: PreviewProps) {
  const [activeTab, setActiveTab] = useState("listener");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading state
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

  const previewImages = {
    listener: "/listener-dashboard.png", // Placeholder - will be replaced with actual images
    creator: "/creator-dashboard.png",  // Placeholder - will be replaced with actual images
    brand: "/brand-dashboard.png"       // Placeholder - will be replaced with actual images
  };

  // Generate placeholder previews until images are available
  const generatePlaceholderPreview = (type: string) => {
    if (type === "listener") {
      return (
        <div className="w-full h-full flex flex-col p-4 gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-audifyx-purple/30 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-audifyx-purple/30 rounded-full w-1/3 animate-pulse"></div>
              <div className="h-3 bg-audifyx-purple/20 rounded-full w-1/4 mt-2 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-audifyx-purple-dark/60 animate-pulse"></div>
            ))}
          </div>
          <div className="h-24 bg-audifyx-purple-dark/40 rounded-lg mt-2 animate-pulse"></div>
          <div className="flex gap-2 mt-auto">
            <div className="w-1/4 h-10 rounded-full bg-audifyx-purple/40 animate-pulse"></div>
            <div className="w-1/4 h-10 rounded-full bg-audifyx-purple/40 animate-pulse"></div>
            <div className="w-1/4 h-10 rounded-full bg-audifyx-purple/40 animate-pulse"></div>
            <div className="w-1/4 h-10 rounded-full bg-audifyx-purple/40 animate-pulse"></div>
          </div>
        </div>
      );
    }
    
    if (type === "creator") {
      return (
        <div className="w-full h-full flex flex-col p-4 gap-4">
          <div className="h-40 bg-audifyx-purple/20 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-audifyx-purple-dark/60 rounded-lg animate-pulse"></div>
            <div className="h-24 bg-audifyx-purple-dark/60 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-32 bg-audifyx-purple-dark/40 rounded-lg animate-pulse"></div>
          <div className="flex gap-2 mt-auto">
            <div className="w-1/3 h-10 rounded-full bg-audifyx-blue/30 animate-pulse"></div>
            <div className="w-1/3 h-10 rounded-full bg-audifyx-blue/30 animate-pulse"></div>
            <div className="w-1/3 h-10 rounded-full bg-audifyx-blue/30 animate-pulse"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex flex-col p-4 gap-4">
        <div className="h-24 bg-audifyx-blue/20 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-32 bg-audifyx-purple-dark/60 rounded-lg animate-pulse"></div>
          <div className="h-32 bg-audifyx-purple-dark/60 rounded-lg animate-pulse"></div>
          <div className="h-32 bg-audifyx-purple-dark/60 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-48 bg-audifyx-purple-dark/40 rounded-lg animate-pulse"></div>
        <div className="flex justify-between mt-auto">
          <div className="w-1/2 h-10 rounded-lg bg-audifyx-blue/30 animate-pulse"></div>
          <div className="w-1/3 h-10 rounded-lg bg-audifyx-blue/30 animate-pulse"></div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("tablet-mockup w-full max-w-md mx-auto", className)}>
      <div className="relative border-8 md:border-[12px] border-audifyx-charcoal rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-audifyx-purple-dark to-black opacity-70"></div>
        
        <div className="relative z-10">
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="bg-audifyx-charcoal px-3 py-2">
              <TabsList className="grid w-full grid-cols-3 bg-audifyx-purple-dark/50">
                <TabsTrigger value="listener">Listener</TabsTrigger>
                <TabsTrigger value="creator">Creator</TabsTrigger>
                <TabsTrigger value="brand">Brand</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="aspect-[3/4] bg-gradient-to-b from-audifyx-purple-dark/80 to-black">
              <TabsContent value="listener" className="h-full">
                {generatePlaceholderPreview("listener")}
              </TabsContent>
              
              <TabsContent value="creator" className="h-full">
                {generatePlaceholderPreview("creator")}
              </TabsContent>
              
              <TabsContent value="brand" className="h-full">
                {generatePlaceholderPreview("brand")}
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        {/* Tablet camera & button */}
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-4 h-4 bg-audifyx-charcoal/80 rounded-full"></div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-audifyx-charcoal/80"></div>
      </div>
    </div>
  );
}
