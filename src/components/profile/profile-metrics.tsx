
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Music, Video, Compass, Users, Heart, Play, Award } from "lucide-react";

interface ProfileMetricsProps {
  accountType?: string;
}

interface MetricItem {
  label: string;
  value: number;
  icon: React.ReactNode;
}

export function ProfileMetrics({ accountType = "listener" }: ProfileMetricsProps) {
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  useEffect(() => {
    // Mock metrics based on account type
    if (accountType === "listener") {
      setMetrics([
        { label: "Favorites", value: 0, icon: <Heart className="h-5 w-5 text-pink-500" /> },
        { label: "Playlists", value: 0, icon: <Music className="h-5 w-5 text-blue-500" /> },
        { label: "Following", value: 0, icon: <Users className="h-5 w-5 text-green-500" /> },
        { label: "Points", value: 0, icon: <Award className="h-5 w-5 text-yellow-500" /> },
      ]);
    } else if (accountType === "creator") {
      setMetrics([
        { label: "Tracks", value: 0, icon: <Music className="h-5 w-5 text-purple-500" /> },
        { label: "Followers", value: 0, icon: <Users className="h-5 w-5 text-blue-500" /> },
        { label: "Streams", value: 0, icon: <Play className="h-5 w-5 text-green-500" /> },
        { label: "Points", value: 0, icon: <Award className="h-5 w-5 text-yellow-500" /> },
      ]);
    } else if (accountType === "brand") {
      setMetrics([
        { label: "Campaigns", value: 0, icon: <LayoutDashboard className="h-5 w-5 text-blue-500" /> },
        { label: "Creators", value: 0, icon: <Users className="h-5 w-5 text-purple-500" /> },
        { label: "Audience", value: 0, icon: <Compass className="h-5 w-5 text-green-500" /> },
        { label: "ROI", value: 0, icon: <Award className="h-5 w-5 text-yellow-500" /> },
      ]);
    }
  }, [accountType]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-audifyx-purple/20 bg-gradient-card">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-2xl mb-1">{metric.icon}</div>
            <div className="text-xl font-bold text-audifyx-purple">{metric.value}</div>
            <div className="text-sm text-gray-400">{metric.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
