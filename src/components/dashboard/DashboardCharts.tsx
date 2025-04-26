
import React from "react";
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Line, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityData {
  name: string;
  value: number;
}

interface EngagementData {
  date: string;
  likes: number;
  shares: number;
}

interface FollowerData {
  date: string;
  followers: number;
}

interface DashboardChartsProps {
  activityData: ActivityData[];
}

export const ActivityChart: React.FC<DashboardChartsProps> = ({ activityData }) => {
  return (
    <Card className="bg-audifyx-purple/20 border-audifyx-purple/20">
      <CardHeader>
        <CardTitle className="text-xl">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#9b87f5" />
              <YAxis stroke="#9b87f5" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e1e2e', 
                  borderColor: '#9b87f5',
                  color: '#ffffff'  
                }}
              />
              <Bar dataKey="value" fill="#9b87f5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const EngagementChart: React.FC<{ data: EngagementData[] }> = ({ data }) => {
  return (
    <Card className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
      <CardHeader>
        <CardTitle className="text-base">Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="date" stroke="#9b87f5" />
              <YAxis stroke="#9b87f5" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e1e2e', 
                  borderColor: '#9b87f5',
                  color: '#ffffff'  
                }}
              />
              <Line type="monotone" dataKey="likes" stroke="#9b87f5" strokeWidth={2} />
              <Line type="monotone" dataKey="shares" stroke="#7E69AB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const AudienceChart: React.FC<{ data: FollowerData[] }> = ({ data }) => {
  return (
    <Card className="bg-audifyx-charcoal/40 border-audifyx-purple/10">
      <CardHeader>
        <CardTitle className="text-base">Audience Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="date" stroke="#9b87f5" />
              <YAxis stroke="#9b87f5" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e1e2e', 
                  borderColor: '#9b87f5',
                  color: '#ffffff'  
                }}
              />
              <Line type="monotone" dataKey="followers" stroke="#0EA5E9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
