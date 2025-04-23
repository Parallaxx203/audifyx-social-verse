
import React from "react";
import { useDiscoveryFeed } from "@/hooks/useDiscoveryFeed";
import { Card } from "@/components/ui/card";
import { Music, Image, User } from "lucide-react";

export function DiscoverFeed() {
  const { data: feed, isLoading } = useDiscoveryFeed();

  if (isLoading) return <div>Loading...</div>;

  if (!feed || feed.length === 0) return (
    <div className="text-center text-gray-400 py-10">No content yet!</div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {feed.map((item: any) => (
        <Card key={`${item.type}-${item.id}`} className="p-4 flex flex-col gap-2 bg-audifyx-purple-dark/70">
          <div className="flex items-center gap-2 mb-2 text-audifyx-purple font-semibold">
            {item.type === "post" ? <User className="w-4 h-4" /> : <Music className="w-4 h-4" />}
            <span className="capitalize">{item.type}</span>
          </div>
          <div className={`font-lg ${item.type === "track" ? "font-bold" : ""}`}>
            {item.title}
          </div>
          {item.media_url && (
            item.type === "track" ? (
              <audio controls src={item.media_url} className="w-full my-1" />
            ) : (
              <img src={item.media_url} alt="" className="max-h-40 w-full object-cover rounded" />
            )
          )}
          <div className="text-xs text-gray-400">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </Card>
      ))}
    </div>
  );
}
