
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileMetricsProps {
  accountType?: string;
}

interface MetricItem {
  label: string;
  value: number;
  icon: string;
}

export function ProfileMetrics({ accountType = "listener" }: ProfileMetricsProps) {
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  useEffect(() => {
    // Mock metrics based on account type

      ]);
    } else if (accountType === "brand") {
      setMetrics([
        
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
