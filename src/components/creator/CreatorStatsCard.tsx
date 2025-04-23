
import React from "react";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { Card, CardContent } from "@/components/ui/card";

export function CreatorStatsCard({ userId }: { userId: string }) {
  const { data: stats, isLoading } = useCreatorStats(userId);

  if (isLoading) return <div>Loading stats...</div>;
  if (!stats) return <div>No stats found.</div>;

  const fields = [
    { label: "Views", value: stats.views_count, color: "text-blue-300" },
    { label: "Likes", value: stats.likes_count, color: "text-pink-300" },
    { label: "Shares", value: stats.shares_count, color: "text-purple-300" },
    { label: "Comments", value: stats.comments_count, color: "text-green-300" },
    { label: "Play Time", value: stats.total_play_time + "s", color: "text-orange-300" },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {fields.map(f => (
        <Card key={f.label} className="w-32 bg-audifyx-purple-dark/80">
          <CardContent className={`p-4 text-center`}>
            <div className={`text-lg font-bold ${f.color}`}>{f.value}</div>
            <div className="text-xs mt-1 text-gray-400">{f.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
