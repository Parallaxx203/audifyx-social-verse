
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InfoTabs() {
  const navigate = useNavigate();
  
  return (
    <Tabs defaultValue="about" className="w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-3 bg-audifyx-purple-dark/30">
        <TabsTrigger value="about">About Audifyx</TabsTrigger>
        <TabsTrigger value="creators">For Creators</TabsTrigger>
        <TabsTrigger value="brands">For Brands</TabsTrigger>
      </TabsList>
      
      <TabsContent value="about" className="mt-6">
        <Card className="border-audifyx-purple/20 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient">About Audifyx</CardTitle>
            <CardDescription className="text-lg text-foreground/90">
              Audifyx is a revolutionary social music platform that brings together listeners, creators, and brands in a fiber ecosystem. We're reimagining how music is shared, discovered, and monetized.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              title="Connect" 
              description="Connect with your favorite artists and build real relationships."
              icon="🔗"
            />
            <FeatureCard 
              title="Share" 
              description="Share your musical journey and discover music with friends."
              icon="🎵"
            />
            <FeatureCard 
              title="Earn" 
              description="Support creators with gifts or earn as a creator through our reward system."
              icon="💰"
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/auth")}
              className="ml-auto bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            >
              Join Now <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="creators" className="mt-6">
        <Card className="border-audifyx-purple/20 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient">For Creators</CardTitle>
            <CardDescription className="text-lg text-foreground/90">
              Audifyx offers creators a direct connection to fans, multiple revenue streams, and a supportive ecosystem.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              title="Upload Your Music" 
              description="Upload and promote your tracks with discovery tools."
              icon="🎧"
            />
            <FeatureCard 
              title="Build Community" 
              description="Use DMs, video/audio calls, and interactive profiles to connect with fans."
              icon="👥"
            />
            <FeatureCard 
              title="Monetize" 
              description="Earn through gifts, brand deals, and direct community support."
              icon="💸"
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/auth")}
              className="ml-auto bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            >
              Join as Creator Now <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="brands" className="mt-6">
        <Card className="border-audifyx-purple/20 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient">For Brands</CardTitle>
            <CardDescription className="text-lg text-foreground/90">
              Connect authentically with music communities and run targeted campaigns with measurable results.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              title="Authentic Engagement" 
              description="Connect organically with active music users."
              icon="🌟"
            />
            <FeatureCard 
              title="Transparent Analytics" 
              description="Real-time campaign analytics dashboard."
              icon="📊"
            />
            <FeatureCard 
              title="Creator Partnerships" 
              description="Find trending creators to run campaigns with."
              icon="🤝"
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/auth")}
              className="ml-auto bg-audifyx-purple hover:bg-audifyx-purple-vivid"
            >
              Join as Brand Now <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="music-card p-6 rounded-xl flex flex-col items-center text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
