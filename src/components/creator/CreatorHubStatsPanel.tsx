import React from "react";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { Card } from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Line 
} from "recharts";

export function CreatorHubStatsPanel({ userId }: { userId: string }) {
  const { data: stats, isLoading, error } = useCreatorStats(userId);

  if (isLoading) {
    return <div className="p-4">Loading stats...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading stats: {error.message}</div>;
  }

  // Mock data for graphs
  const chartData = [
    { name: "Views", value: stats?.views_count ?? 0 },
    { name: "Likes", value: stats?.likes_count ?? 0 },
    { name: "Shares", value: stats?.shares_count ?? 0 },
    { name: "Comments", value: stats?.comments_count ?? 0 },
    { name: "Play Time (s)", value: stats?.total_play_time ?? 0 },
  ];

  return (
    <Card className="bg-gradient-to-br from-audifyx-purple-dark/70 to-black/60 p-6 rounded-2xl shadow-vivid">
      <h2 className="text-2xl font-bold mb-4 text-white drop-shadow">Your Creator Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#bbb" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#a593f7" />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}